"use strict";
const http = require("node:http");
const { URL } = require("node:url");
const fs = require('fs');
const path = require('path');
const { sendSubmissionToBackend } = require("./sendToBackend");

const PORT = 8000;
const MAX_FEEDBACK_LENGTH = 500;
const TITLE = process.env.TITLE || "FunctionGraph Demo";
const FAVICON_PATH = path.join(__dirname, "static", "favicon.ico");

const { htmlpage_vote } = require("./htmlpage");

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

function sendFavicon(response) {
  const iconStream = fs.createReadStream(FAVICON_PATH);

  iconStream.on("error", () => {
    sendJson(response, 404, { error: "favicon not found" });
  });

  response.writeHead(200, {
    "Content-Type": "image/x-icon",
    "Cache-Control": "public, max-age=86400",
  });

  iconStream.pipe(response);
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
  return htmlpage_vote(safeTitle);
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

  if (request.method === "GET" && url.pathname === "/favicon.ico") {
    sendFavicon(response);
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
