"use strict";
const http = require("node:http");
const { URL } = require("node:url");

const { sendSubmissionToBackend } = require("./sendToBackend");

const PORT = 8000;
const MAX_FEEDBACK_LENGTH = 500;
const TITLE = process.env.TITLE || "FunctionGraph Demo";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function sendHtml(response, statusCode, html) {
  response.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(html);
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });

    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function validateSubmission(payload) {
  const rating = Number(payload.rating);
  const feedback =
    typeof payload.feedback === "string" ? payload.feedback.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Rating must be a whole number from 1 to 5." };
  }

  if (feedback.length === 0) {
    return { error: "Feedback is required." };
  }

  if (feedback.length > MAX_FEEDBACK_LENGTH) {
    return {
      error: `Feedback must be ${MAX_FEEDBACK_LENGTH} characters or less.`,
    };
  }

  return {
    data: {
      rating,
      feedback,
    },
  };
}

function renderPage() {
  const safeTitle = escapeHtml(TITLE);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Voting App</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #16324f;
      --muted: #5c6b7a;
      --paper: #fffdf8;
      --panel: rgba(255, 255, 255, 0.78);
      --line: rgba(22, 50, 79, 0.14);
      --accent: #ef8f00;
      --accent-soft: #ffdba3;
      --success: #2d6a4f;
      --error: #b42318;
      --shadow: 0 24px 60px rgba(22, 50, 79, 0.12);
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      min-height: 100vh;
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
      padding: 24px;
    }

    .shell {
      width: min(100%, 760px);
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
      margin: 18px 0 12px;
      font-size: clamp(2.2rem, 5vw, 3.6rem);
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

    form {
      padding: 20px 32px 32px;
      display: grid;
      gap: 22px;
    }

    .card {
      padding: 20px;
      border-radius: 22px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(22, 50, 79, 0.1);
    }

    .label {
      display: block;
      margin-bottom: 12px;
      font-size: 1rem;
      font-weight: 700;
    }

    .stars {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-end;
      gap: 10px;
    }

    .stars input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
    }

    .stars label {
      font-size: clamp(2rem, 7vw, 3rem);
      line-height: 1;
      cursor: pointer;
      color: #d4d6db;
      transition: transform 140ms ease, color 140ms ease;
    }

    .stars label:hover,
    .stars label:hover ~ label,
    .stars input:checked ~ label {
      color: var(--accent);
      transform: translateY(-2px) scale(1.02);
    }

    textarea {
      width: 100%;
      min-height: 140px;
      resize: vertical;
      padding: 14px 16px;
      border-radius: 16px;
      border: 1px solid rgba(22, 50, 79, 0.15);
      background: rgba(255, 255, 255, 0.94);
      font: inherit;
      color: var(--ink);
    }

    textarea:focus {
      outline: 3px solid rgba(239, 143, 0, 0.18);
      border-color: rgba(239, 143, 0, 0.7);
    }

    .row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    button {
      border: 0;
      border-radius: 999px;
      padding: 14px 22px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      color: #fff;
      background: linear-gradient(135deg, #16324f, #24517d);
      box-shadow: 0 14px 30px rgba(22, 50, 79, 0.2);
      transition: transform 140ms ease, box-shadow 140ms ease, opacity 140ms ease;
    }

    button:hover { transform: translateY(-1px); }
    button:disabled { opacity: 0.7; cursor: progress; }

    .hint,
    .status {
      font-size: 0.95rem;
      color: var(--muted);
    }

    .status[data-state="error"] { color: var(--error); }
    .status[data-state="success"] { color: var(--success); }

    .fineprint {
      font-size: 0.9rem;
      line-height: 1.5;
      color: var(--muted);
    }

    .powered-by {
      padding: 0 32px 26px;
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

    @media (max-width: 640px) {
      .hero,
      form,
      .powered-by {
        padding-left: 20px;
        padding-right: 20px;
      }
    }
  </style>
</head>
<body>
  <main class="shell">
    <section class="hero">
      <span class="eyebrow">${safeTitle}</span>
      <h1>Rate the experience.</h1>
      <p>Pick a score from one to five stars, leave feedback, and submit.<br>The function validates the input and records each vote in the execution logs.</p>
    </section>

    <form id="vote-form">
      <section class="card">
        <span class="label">Your rating</span>
        <div class="stars" aria-label="5 star rating">
          <input id="star5" name="rating" type="radio" value="5" required>
          <label for="star5" title="5 stars">★</label>
          <input id="star4" name="rating" type="radio" value="4">
          <label for="star4" title="4 stars">★</label>
          <input id="star3" name="rating" type="radio" value="3">
          <label for="star3" title="3 stars">★</label>
          <input id="star2" name="rating" type="radio" value="2">
          <label for="star2" title="2 stars">★</label>
          <input id="star1" name="rating" type="radio" value="1">
          <label for="star1" title="1 star">★</label>
        </div>
      </section>

      <section class="card">
        <label class="label" for="feedback">Feedback</label>
        <textarea id="feedback" name="feedback" maxlength="500" placeholder="Tell us what worked well or what should improve." required></textarea>
        <p class="hint">Required, up to 500 characters.</p>
      </section>

      <div class="row">
        <button id="submit-button" type="submit">Submit vote</button>
        <div class="status" id="status" aria-live="polite"></div>
      </div>

    </form>

    <p class="powered-by">
      <a href="https://public.t-cloud.com/en/products-services/core-services/functiongraph" target="_blank" rel="noopener noreferrer">Powered by T Cloud Public</a>
    </p>
  </main>

  <script>
    const form = document.getElementById("vote-form");
    const button = document.getElementById("submit-button");
    const status = document.getElementById("status");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        rating: Number(formData.get("rating")),
        feedback: String(formData.get("feedback") || "")
      };

      button.disabled = true;
      status.dataset.state = "";
      status.textContent = "Submitting...";

      try {
        const response = await fetch("/vote", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to submit the vote.");
        }

        status.dataset.state = "success";
        status.textContent = result.message;
        form.reset();
      } catch (error) {
        status.dataset.state = "error";
        status.textContent = error.message;
      } finally {
        button.disabled = false;
      }
    });
  </script>
</body>
</html>`;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(
    request.url || "/",
    `http://${request.headers.host || `127.0.0.1:${PORT}`}`,
  );

  if (request.method === "GET" && url.pathname === "/") {
    sendHtml(response, 200, renderPage());
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && url.pathname === "/vote") {
    try {
      const rawBody = await collectRequestBody(request);
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const result = validateSubmission(payload);

      if (result.error) {
        sendJson(response, 400, { error: result.error });
        return;
      }

      const submission = {
        ...result.data,
        submittedAt: Date.now(),

        // add function name and request ID from headers
        // for better traceability in backend logs
        functionName: request.headers["x-cff-func-name"] || "",
        requestId: request.headers["x-cff-request-id"] || "",
      };

      console.log(JSON.stringify(submission));

      {
        // 1. agency needed
        // 2. enable "Include Keys" to get ak/sk and token in FunctionGraph configuration
        const ak = request.headers["x-cff-security-access-key"] || "";
        const sk = request.headers["x-cff-security-secret-key"] || "";
        const token = request.headers["x-cff-security-token"] || "";

        const backend_fg_urn = process.env.BACKEND_FG_URN || "";

        if (!ak || !sk || !token || !backend_fg_urn) {
          console.warn(
            "Missing temporary credentials in headers or backend configuration.\n"+
            " You need to define an agency with 'FunctionGraph CommonOperations' permission.",
          );

          sendJson(response, 500, {
            message: `Backend not configured correctly.`,
          });
          return;
        } else {
          let result = await sendSubmissionToBackend(
            backend_fg_urn,
            ak,
            sk,
            token,
            submission,
          ).catch((err) => {
            console.error("Error sending submission to backend:", err);
          });
          console.log("Result from backend invocation:", result);
        }
      }

      const safeFeedback = escapeHtml(submission.feedback);
      sendJson(response, 200, {
        message: `Thanks for the ${submission.rating}-star vote. Feedback received: \"${safeFeedback}\"`,
      });
      return;
    } catch (error) {
      if (error instanceof SyntaxError) {
        sendJson(response, 400, { error: "Request body must be valid JSON." });
        return;
      }

      sendJson(response, 500, { error: "Unexpected server error." });
      return;
    }
  }

  sendJson(response, 404, { error: "Not found." });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Voting app listening on http://0.0.0.0:${PORT}`);
});
