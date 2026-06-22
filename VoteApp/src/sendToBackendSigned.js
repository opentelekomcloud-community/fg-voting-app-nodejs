"use strict";
const https = require("https");
const { Signer, HttpRequest } = require("otc-api-sign-sdk-nodejs");

/**
 * Sample code to invoke FunctionGraph function with SecuritySAccessKey/SecuritySecretKey and SecurityToken.
 * @param {*} backend_fg_urn  URN of the backend FunctionGraph function
 * @param {*} ak security access key from agency
 * @param {*} sk security secret key from agency
 * @param {*} token security token from agency
 * @param {*} submission data to be sent to the backend
 * @returns 
 */
async function sendSubmissionToBackendAKSK(
  backend_fg_urn,
  ak,
  sk,
  token,
  submission,
) {
  // get region from backend_fg_urn
  const region = backend_fg_urn.split(":")[2] || "eu-de";
  const fgEndpoint = `https://functiongraph.${region}.otc.t-systems.com`;
  const projectId = process.env.RUNTIME_PROJECT_ID || "";

  // Endpoint for asynchronous invocation
  const invokeURI = `${fgEndpoint}/v2/${projectId}/fgs/functions/${backend_fg_urn}/invocations-async`;
  // or synchronous invocation
  // const invokeURI = `${fgEndpoint}/v2/${projectId}/fgs/functions/${backend_fg_urn}/invocations`;

  // set body according to your function input
  const body = {
    rating: submission.rating,
    feedback: submission.feedback,
    submittedAt: submission.submittedAt,
    functionName: submission.functionName,
    requestId: submission.requestId,
  };
  const payload = JSON.stringify(body);

  // set headers
  const headers = {
    "Content-Type": "application/json;charset=utf8",
    Host: new URL(fgEndpoint).host,
    "X-Project-Id": projectId,
  };

  // create HttpRequest instance
  const request = new HttpRequest("POST", invokeURI, headers, payload);

  // create Signer instance and use temporary ak/sk/token to sign the request
  const signer = new Signer();
  signer.Key = ak;
  signer.Secret = sk;
  signer.SecurityToken = token;

  // sign the request
  const signedRequest = signer.Sign(request);

  // send the signed request
  return new Promise((resolve, reject) => {
    const req = https.request(signedRequest, (res) => {
      res.setEncoding("utf8");

      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });

      res.on("end", () => {
        console.log("Response: ", responseBody);
        if (res.statusCode && res.statusCode >= 400) {
          reject(
            new Error(
              `Backend request failed with status ${res.statusCode}: ${responseBody}`,
            ),
          );
          return;
        }

        resolve(responseBody);
      });
    });

    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}


module.exports = { sendSubmissionToBackendAKSK };
