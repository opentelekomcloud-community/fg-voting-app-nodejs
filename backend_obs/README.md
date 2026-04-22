# backend_obs

FunctionGraph event function in Node.js 20.15 to store data in OBS bucket objects.

## Prerequisites

### Project eu-de_fg-voting-app created

Create a project **eu-de_fg-voting-app** as described in [../README.md](../README.md)

### OBS Bucket created

Create an OBS bucket using OBS console with following setting:

- Region: **eu-de**
- Bucket Name: **fg-voting-app-votes**
- Storage Class: **Standard**
- Bucket Policies: **Private**
- Enterprise Project: **default**

### Agency created

Create an agency using IAM console with following settings:

- Agency Name: **fg-voting-app_backend_obs**
- Agency Type: **Cloud Service**
- Cloud Service: **FunctionGraph**
- Validity Period: **Unlimited**
- Description: **Agency for FG Function backend_obs**
- Permissions:
  - `OBS OperateAccess`

### LogGroup and LogStream created

In project **eu-de_fg-voting-app**, create a log group using LTS console with following settings:

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**

In this log group, create a log stream with:
- Log Stream Name: **lts-topic-backend-obs** 

## Deploy to to T Cloud Public FunctionGraph

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function
 - Create with: **Create from scratch**
 - Function Type: **Event Function**
 - Region: **eu-de/fg-voting-app**
 - Function Name: **backend_obs**
 - Enterprise Project: **default**
 - Agency: **fg-voting-app_backend_obs**
 - Runtime: **Node.js 20.15**

Insert code:
 - Copy&Paste code from [index.js](index.js) to code window

Configure function:
  - `Basic Settings`:
    - Handler: **index.handler**
  - `Logs`
    - Collect Logs: **enable**
    - Log Group: **lts-group-fg-voting-app**
    - Log Stream: **lts-topic-backend-obs**
  - `Environment variables` (Optional, defaults are shown here)
    - OBS_ENDPOINT = https://obs.eu-de.otc.t-systems.com
    - OBS_BUCKET_NAME = fg-voting-app-votes

Create a test event:
  - Create a test event using `Blank Template` with:
  - Name: **rating_5**
  - Payload: use json data from [resources/test_event.json](resources/test_event.json)
