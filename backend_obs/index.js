"use strict";
// use the OBS SDK bundled with FunctionGraph runtime
const ObsClient = require("esdk-obs-nodejs");

async function putObject(obsClient, bucketName, key, data, logger) {
  try {
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: data,
    };

    const toResponse = (commonMsg) => ({
      Status: commonMsg.Status,
      Code: commonMsg.Code,
      Message: commonMsg.Message,
      RequestId: commonMsg.RequestId,
    });

    // Upload the object.
    const result = await obsClient.putObject(params);
    if (result.CommonMsg.Status <= 300) {
      logger.info(
        "Put object(%s) under the bucket(%s) successful!!, RequestId: %s, ETag:%s",
        params.Key,
        params.Bucket,
        result.CommonMsg.RequestId,
        result.InterfaceResult.ETag,
      );

      return toResponse(result.CommonMsg);
    }

    logger.info(
      "OBS Error occurred: Status: %d, Code: %s, RequestId: %s, Message: %s",
      result.CommonMsg.Status,
      result.CommonMsg.Code,
      result.CommonMsg.RequestId,
      result.CommonMsg.Message,
    );

    return toResponse(result.CommonMsg);
  } catch (error) {
    logger.error(error);
    return {
      Status: 500,
      Code: null,
      Message: error.message,
      RequestId: null,
    };
  }
}

/**
 *
 * @param {Object} event
 * @param {number} event.rating
 * @param {string} event.feedback
 * @param {number} event.submittedAt
 * @param {string} [event.functionName] - optional, added for better traceability in backend logs
 * @param {string} [event.requestId] - optional, added for better traceability in backend logs
 * @param {*} context
 * @param {*} callback
 * @returns
 */
exports.handler = async function (event, context) {
  const logger = context.getLogger();

  logger.info("Received event: ", JSON.stringify(event));

  const obsEndpoint =
    context.getUserData("OBS_ENDPOINT") ||
    "https://obs.eu-de.otc.t-systems.com";

  const bucketName = context.getUserData("OBS_BUCKET_NAME") || "fg-voting-app-votes";

  let obsClient = null;
  try {
    // Create an instance of ObsClient.
    obsClient = new ObsClient({
      // set temporary ak/sk/token for authentication
      access_key_id: context.getSecurityAccessKey(),
      secret_access_key: context.getSecuritySecretKey(),
      security_token: context.getSecurityToken(),
      // Enter the endpoint corresponding to the region where the bucket is located.
      server: obsEndpoint,
    });

    const body = JSON.stringify({
      rating: event.rating,
      feedback: event.feedback,
      submittedAt: event.submittedAt,
    });

    const storeTime = Date.now();
    const key =
      event.functionName != undefined
        ? `vote/${storeTime}.json`
        : `test/${storeTime}.json`;

    return await putObject(obsClient, bucketName, key, body, logger);
  } catch (err) {
    logger.info("Error in putObject: ", err);
    throw err;
  } finally {
    obsClient.close();
  }


};
