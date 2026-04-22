"use strict";
const ObsClient = require("esdk-obs-nodejs");

function getQueryStringParameters(event) {
  return event && event.queryStringParameters
    ? event.queryStringParameters
    : {};
}

function normalizeVotes(votes) {
  const voteMap = new Map();

  for (const vote of votes) {
    const rating = Number(vote && vote.rating);
    if (!Number.isFinite(rating)) {
      continue;
    }

    const label = String(Math.round(rating));
    voteMap.set(label, (voteMap.get(label) || 0) + 1);
  }

  // Keep 1-5 visible even when there are no votes yet.
  for (let i = 1; i <= 5; i += 1) {
    const label = String(i);
    if (!voteMap.has(label)) {
      voteMap.set(label, 0);
    }
  }

  return [...voteMap.entries()]
    .map(([rating, count]) => ({ rating, count }))
    .sort((a, b) => Number(a.rating) - Number(b.rating));
}

async function listVoteKeys(obsClient, bucketName, prefix = "vote/") {
  const keys = [];
  let marker;

  do {
    const result = await obsClient.listObjects({
      Bucket: bucketName,
      Prefix: prefix,
      Marker: marker,
      MaxKeys: 1000,
    });

    if (!result || result.CommonMsg.Status >= 300) {
      throw new Error(
        `Failed to list vote objects: ${result && result.CommonMsg ? result.CommonMsg.Message : "unknown error"}`,
      );
    }

    const contents =
      (result.InterfaceResult && result.InterfaceResult.Contents) || [];
    for (const item of contents) {
      if (item && item.Key) {
        keys.push(item.Key);
      }
    }

    marker =
      result.InterfaceResult && result.InterfaceResult.IsTruncated === "true"
        ? result.InterfaceResult.NextMarker
        : undefined;
  } while (marker);

  return keys;
}

async function getVotes(obsClient, bucketName, keys, logger) {
  const votes = [];

  for (const key of keys) {
    try {
      const result = await obsClient.getObject({
        Bucket: bucketName,
        Key: key,
      });

      if (!result || result.CommonMsg.Status >= 300) {
        logger.warn(
          "Skipping object %s due to getObject failure (%s)",
          key,
          result && result.CommonMsg
            ? result.CommonMsg.Message
            : "unknown error",
        );
        continue;
      }

      const rawContent =
        result.InterfaceResult && result.InterfaceResult.Content;
      if (!rawContent) {
        continue;
      }

      const parsed = JSON.parse(String(rawContent));
      votes.push(parsed);
    } catch (err) {
      logger.warn("Skipping malformed vote object %s: %s", key, err.message);
    }
  }

  return votes;
}

function buildHtml(chartData, voteRows, title) {
  const chartDataJson = JSON.stringify(chartData);
  const voteRowsJson = JSON.stringify(voteRows);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Voting Results</title>
    <script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
    <style>
      :root {
        color-scheme: light;
        --ink: #16324f;
        --muted: #5c6b7a;
        --paper: #fffdf8;
        --panel: rgba(255, 255, 255, 0.78);
        --line: rgba(22, 50, 79, 0.14);
        --accent: #ef8f00;
        --success: #2d6a4f;
        --shadow: 0 24px 60px rgba(22, 50, 79, 0.12);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        padding: 24px;
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        color: var(--ink);
        background:
          linear-gradient(180deg, rgba(7, 12, 28, 0.82), rgba(7, 12, 28, 0.9)),
          radial-gradient(circle at 10% 8%, rgba(64, 90, 176, 0.38), transparent 36%),
          radial-gradient(circle at 88% 16%, rgba(26, 153, 124, 0.24), transparent 30%),
          url("https://public.t-cloud.com/_Resources/Persistent/4/4/a/e/44ae9ad3be36e26016be94192023817f83bedcd0/open-telekom-cloud-functiongraph-introduction-575x324.webp") center top / cover no-repeat fixed,
          linear-gradient(180deg, #0d1a38 0%, #071024 62%, #060a1a 100%);
        display: grid;
        place-items: center;
      }

      .shell {
        width: min(100%, 920px);
        background: var(--panel);
        backdrop-filter: blur(10px);
        border: 1px solid var(--line);
        border-radius: 28px;
        box-shadow: var(--shadow);
        overflow: hidden;
      }

      .hero {
        padding: 32px 32px 12px;
      }

      .eyebrow {
        display: inline-block;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.85);
        border: 1px solid var(--line);
        color: var(--muted);
        font-size: 13px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 16px 0 8px;
        font-size: clamp(2rem, 5vw, 3rem);
        line-height: 0.95;
        letter-spacing: -0.04em;
      }

      .hero p {
        margin: 0;
        max-width: 100ch;
        font-size: 1.05rem;
        line-height: 1.6;
        color: var(--muted);
      }

      .card {
        margin: 0 32px 16px;
        padding: 20px;
        border-radius: 22px;
        background: rgba(255, 255, 255, 0.72);
        border: 1px solid rgba(22, 50, 79, 0.1);
      }

      h2 {
        margin: 0 0 10px;
        font-size: 18px;
      }

      #chart {
        width: 100%;
        height: auto;
        display: block;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 14px;
        background: rgba(255, 255, 255, 0.94);
        border-radius: 14px;
        overflow: hidden;
      }

      th,
      td {
        text-align: left;
        padding: 10px 8px;
        border-bottom: 1px solid rgba(22, 50, 79, 0.12);
        vertical-align: top;
      }

      th {
        background: rgba(226, 0, 116, 0.16);
        font-weight: 600;
      }

      th.sortable {
        cursor: pointer;
        user-select: none;
      }

      th.sortable:hover {
        background: rgba(226, 0, 116, 0.28);
      }

      .empty-row {
        color: var(--muted);
      }

      details > summary {
        list-style: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        user-select: none;
      }

      details > summary::-webkit-details-marker {
        display: none;
      }

      details > summary .chevron {
        display: inline-block;
        width: 18px;
        height: 18px;
        transition: transform 200ms ease;
        flex-shrink: 0;
      }

      details[open] > summary .chevron {
        transform: rotate(90deg);
      }

      details > summary h2 {
        margin: 0;
      }

      details > .table-wrap {
        margin-top: 12px;
      }

      .powered-by {
        padding: 2px 32px 26px;
        text-align: right;
        font-size: 0.9rem;
        color: var(--muted);
      }

      .powered-by a {
        color: #e20074;
        text-decoration-color: rgba(22, 50, 79, 0.35);
        text-underline-offset: 3px;
      }

      .powered-by a:hover {
        text-decoration-color: rgba(22, 50, 79, 0.75);
      }

      @media (max-width: 820px) {
        .hero,
        .card,
        .powered-by {
          margin-left: 20px;
          margin-right: 20px;
          padding-left: 16px;
          padding-right: 16px;
        }
      }

      @media (max-width: 640px) {
        body {
          padding: 12px;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <span class="eyebrow">Vote Results</span>
        <h1>${title}</h1>
        <p>Live voting overview with score distribution and individual responses.</p>
      </section>

      <section class="card">
        <svg id="chart" width="680" height="280" role="img" aria-label="Bar chart"></svg>
      </section>

      <section class="card" id="total-votes-section">
        <h2>Total Votes</h2>
        <p id="total-votes-count" style="margin:0; font-size: 2.5rem; font-weight: 700; color: var(--ink);">0</p>
      </section>

      <section class="card">
        <details>
          <summary>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
            <h2>Vote Details</h2>
          </summary>
          <div class="table-wrap">
            <table aria-label="Vote details table">
              <thead>
                <tr>
                  <th class="sortable" data-sort-key="submittedAt">Submitted At <span class="sort-indicator"></span></th>
                  <th class="sortable" data-sort-key="rating">Rating <span class="sort-indicator"></span></th>
                  <th class="sortable" data-sort-key="feedback">Feedback <span class="sort-indicator"></span></th>
                </tr>
              </thead>
              <tbody id="vote-table-body"></tbody>
            </table>
          </div>
        </details>
      </section>

      <p class="powered-by">
        <a href="https://public.t-cloud.com/en/products-services/core-services/functiongraph" target="_blank" rel="noopener noreferrer">Powered by T Cloud Public</a>
      </p>
    </main>

    <script>
      const data = ${chartDataJson};
      const voteRows = ${voteRowsJson};

      const width = 680;
      const height = 280;
      const margin = { top: 20, right: 20, bottom: 20, left: 48 };

      const svg = d3.select("#chart");

      const x = d3
        .scaleBand()
        .domain(data.map((d) => d.rating))
        .range([margin.left, width - margin.right])
        .padding(0.2);

      const maxVotes = d3.max(data, (d) => d.count) || 0;
      const yTickStep = maxVotes <= 10 ? 1 : Math.ceil(maxVotes / 10);
      const yDomainMax =
        maxVotes === 0
          ? 1
          : Math.ceil(maxVotes / yTickStep) * yTickStep;
      const yTickValues = d3.range(0, yDomainMax + yTickStep, yTickStep);

      const y = d3
        .scaleLinear()
        .domain([0, yDomainMax])
        .range([height - margin.bottom, margin.top]);

      svg
        .append("g")
        .attr("fill", "#2563eb")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("x", (d) => x(d.rating))
        .attr("y", (d) => y(d.count))
        .attr("width", x.bandwidth())
        .attr("height", (d) => y(0) - y(d.count));

      svg
        .append("g")
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("x", width / 2)
        .attr("y", 34)
        .attr("fill", "#111827")
        .attr("text-anchor", "middle")
        .text("Rating");

      svg
        .append("g")
        .attr("transform", "translate(" + margin.left + ",0)")
        .call(
          d3
            .axisLeft(y)
            .tickValues(yTickValues)
            .tickFormat(d3.format("d")),
        )
        .append("text")
        .attr("x", -height / 2)
        .attr("y", -36)
        .attr("fill", "#111827")
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Votes");

      const tableBody = document.getElementById("vote-table-body");
      const sortableHeaders = document.querySelectorAll("th.sortable");
      const tableState = {
        key: "submittedAt",
        direction: "asc",
      };

      function compareValues(a, b, key) {
        if (key === "submittedAt") {
          return String(a.submittedAt).localeCompare(String(b.submittedAt));
        }

        if (key === "rating") {
          return Number(a.rating) - Number(b.rating);
        }

        return String(a.feedback || "").localeCompare(String(b.feedback || ""));
      }

      function renderTableRows(rows) {
        tableBody.innerHTML = "";

        if (!rows.length) {
          const row = document.createElement("tr");
          row.className = "empty-row";

          const cell = document.createElement("td");
          cell.colSpan = 3;
          cell.textContent = "No vote data available.";
          row.appendChild(cell);

          tableBody.appendChild(row);
          return;
        }

        for (const vote of rows) {
          const row = document.createElement("tr");

          const submittedAtCell = document.createElement("td");
          submittedAtCell.textContent = String(vote.submittedAt);

          const ratingCell = document.createElement("td");
          ratingCell.textContent = String(vote.rating);

          const feedbackCell = document.createElement("td");
          feedbackCell.textContent = String(vote.feedback || "");

          row.appendChild(submittedAtCell);
          row.appendChild(ratingCell);
          row.appendChild(feedbackCell);
          tableBody.appendChild(row);
        }
      }

      function updateSortIndicators() {
        sortableHeaders.forEach((header) => {
          const indicator = header.querySelector(".sort-indicator");
          const key = header.getAttribute("data-sort-key");

          if (!indicator) {
            return;
          }

          if (key === tableState.key) {
            indicator.textContent = tableState.direction === "asc" ? "▲" : "▼";
          } else {
            indicator.textContent = "";
          }
        });
      }

      function sortAndRender() {
        const sorted = [...voteRows].sort((a, b) => {
          const base = compareValues(a, b, tableState.key);
          return tableState.direction === "asc" ? base : -base;
        });

        renderTableRows(sorted);
        updateSortIndicators();
      }

      sortableHeaders.forEach((header) => {
        header.addEventListener("click", () => {
          const key = header.getAttribute("data-sort-key");
          if (!key) {
            return;
          }

          if (tableState.key === key) {
            tableState.direction = tableState.direction === "asc" ? "desc" : "asc";
          } else {
            tableState.key = key;
            tableState.direction = "asc";
          }

          sortAndRender();
        });
      });

      sortAndRender();

      document.getElementById("total-votes-count").textContent = voteRows.length;
    </script>
  </body>
</html>`;
}

/** * FunctionGraph event handler that generates an HTML page showing the voting results
 * based on vote data stored in OBS. The page includes a bar chart and a table with vote details.
 *
 * Query parameters:
 * - test (optional): If set to "true", shows test vote results from OBS with prefix "test/" instead of "vote/"
 *
 * @param {Object} event - The API Gateway event object containing the request details
 * @param {Object} event.queryStringParameters - The query parameters from the API Gateway event
 * @param {string} event.queryStringParameters.test - Optional flag to show test vote results
 *
 * @param {*} context - The context object from FunctionGraph, providing access to logging and user data
 *
 * @returns {Object} The HTTP response object containing the generated HTML page with voting results
 */
exports.handler = async (event, context) => {
  const logger = context && context.getLogger ? context.getLogger() : console;
  logger.info("Rendering vote chart from OBS data");

  let title = "'Votes - FunctionGraph'";

  const obsEndpoint =
    context.getUserData("OBS_ENDPOINT") ||
    "https://obs.eu-de.otc.t-systems.com";

  const bucketName = context.getUserData("OBS_BUCKET_NAME") || "fg-voting-app-votes";

  let obsClient;
  let chartData = [
    { rating: "1", count: 0 },
    { rating: "2", count: 0 },
    { rating: "3", count: 0 },
    { rating: "4", count: 0 },
    { rating: "5", count: 0 },
  ];
  let voteRows = [];

  try {
    const accessKey = context.getSecurityAccessKey();
    const secretKey = context.getSecuritySecretKey();
    const securityToken = context.getSecurityToken();

    if (!accessKey || !secretKey) {
      throw new Error("OBS credentials are not available in runtime context. You must configure an Agency with OBS access and assign it to the function.");
    }

    obsClient = new ObsClient({
      access_key_id: accessKey,
      secret_access_key: secretKey,
      security_token: securityToken,
      server: obsEndpoint,
    });

    const query = getQueryStringParameters(event);

    const isTest = query.test || "";
    logger.info(isTest);

    let prefix = "vote/";
    if (isTest.toLowerCase() === "true") {
      title = title + " (Test)";
      prefix = "test/";
    }

    const keys = await listVoteKeys(obsClient, bucketName, prefix);

    logger.info(
      "Found %d vote objects in OBS with prefix '%s'",
      keys.length,
      prefix,
    );
    logger.info(keys.map((key) => ` - ${key}`).join("\n"));

    const votes = await getVotes(obsClient, bucketName, keys, logger);
    chartData = normalizeVotes(votes);
    voteRows = votes
      .map((vote) => ({
        submittedAt: Number(vote && vote.submittedAt),
        rating: vote && vote.rating,
        feedback: vote && vote.feedback,
      }))
      .filter((vote) => Number.isFinite(vote.submittedAt))
      .sort((a, b) => a.submittedAt - b.submittedAt)
      .map((vote) => ({
        submittedAt: new Date(vote.submittedAt).toISOString(),
        rating: vote.rating,
        feedback: vote.feedback,
      }));

    logger.info("Loaded %d vote objects from OBS", votes.length);
  } catch (err) {
    logger.error("Failed to load votes from OBS: %s", err.message);
  } finally {
    if (obsClient) {
      obsClient.close();
    }
  }

  const html = buildHtml(chartData, voteRows, title);

  return {
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="chart.html"',
    },
    body: html,
  };
};
