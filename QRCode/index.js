"use strict";

const { URL } = require("node:url");
const QRCode = require("qrcode");

const DEFAULT_PNG_WIDTH = 200;
const MAX_PNG_WIDTH = 1024;

function getQueryParameters(event) {
  return event && event.queryStringParameters
    ? event.queryStringParameters
    : {};
}

function getPngWidth(event, defaultWidth) {
  const width = parseInt(event.queryStringParameters.width || "", 10);

  if (Number.isInteger(width) && width > 150 && width < MAX_PNG_WIDTH) {
    return width;
  }

  return defaultWidth;
}

function validateUrl(rawUrl, label = "URL") {
  if (typeof rawUrl !== "string" || rawUrl.trim().length === 0) {
    throw new Error(`A non-empty ${label.toLowerCase()} is required.`);
  }

  const parsed = new URL(rawUrl.trim());

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Only http and https URLs are supported.");
  }

  return parsed.toString();
}

function buildResponse(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

/**
 * FunctionGraph event handler that generates a QR code PNG for a given URL
 * and returns it as a base64-encoded string in the response.
 *
 * url is mandatory as query parameter, e.g. /?url=https://example.com
 * width can be optionally provided as query parameter, e.g. /?url=https://example.com&width=256
 *
 * @param {Object} event - The API Gateway event object containing the request details
 * @param {Object} event.queryStringParameters - The query parameters from the API Gateway event
 * @param {string} event.queryStringParameters.url - The URL to encode in the QR code
 * @param {string} [event.queryStringParameters.width] - Optional width of the generated PNG (default: 200, max: 1024)
 * @param {string} event.httpMethod - The HTTP method from the API Gateway event (here: GET)
 * @param {string} event.path - The path from the API Gateway event (here: /qrcode)
 *
 * @param {*} context - The context object from FunctionGraph, providing access to logging and user data
 *
 * @returns {Promise<Object>} APIGResponse - The response object containing the QR code PNG as a base64-encoded string
 * @throws {Error} Throws an error if the URL is invalid or if there are issues generating the QR code
 */
exports.handler = async (event, context) => {
  const logger = context && context.logger ? context.logger : console;

  try {
    // get environment variable for default PNG width, fallback to constant if not set
    const defaultPNGWidth =
      context.getUserData("defaultPNGWidth") || DEFAULT_PNG_WIDTH;
    const query = getQueryParameters(event);
    const pngWidth = getPngWidth(event, defaultPNGWidth);

    const url = query.url  || context.getUserData("defaultUrl");

    const targetUrl = validateUrl(url);
    const pngBuffer = await QRCode.toBuffer(targetUrl, {
      type: "png",
      width: pngWidth,
      margin: 2,
      errorCorrectionLevel: "H",
    });

    logger.info(
      `Generated QR code for URL: ${targetUrl} with width: ${pngWidth}`,
    );

    const responseBuffer = pngBuffer;

    return {
      statusCode: 200,
      isBase64Encoded: true,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Disposition": 'inline; filename="qrcode.png"',
      },
      body: responseBuffer.toString("base64"),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error generating QR code: ${message}`);
    return buildResponse(400, { error: message });
  }
};
