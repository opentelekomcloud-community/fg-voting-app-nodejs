.. _ref_backend_obs:

FunctionGraph backend_obs Event Function
============================================

FunctionGraph Event function in Node.js 20.15 to store data in OBS bucket objects.

Prerequisites for backend_obs
------------------------------

Following project will be used in deployment:

- **eu-de_fg-voting-app**
 

Create an OBS bucket using OBS console with following setting:

- Region: **eu-de**
- Bucket Name: **fg-voting-app-votes**
- Storage Class: **Standard**
- Bucket Policies: **Private**
- Enterprise Project: **default**

Create an agency using IAM console with following settings:

- Agency Name: **fg-voting-app_backend_obs**
- Agency Type: **Cloud Service**
- Cloud Service: **FunctionGraph**
- Validity Period: **Unlimited**
- Description: **Agency for FG Function backend_obs**
- Permissions:
  - `OBS OperateAccess`
  - Scope: **All resources**

Create following LogGroup and LogStream in project **eu-de_fg-voting-app**
(if not exist yet):

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**
- In this log group, create a log stream with:

  - Log Stream Name: **lts-topic-backend-obs** 

Deploy backend_obs to T Cloud Public FunctionGraph
---------------------------------------------------

Prepare deployment for backend_obs 
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. Install dependencies
 
   .. code-block:: bash

      npm install

2. Create the deployment ZIP from the project root:
 
    .. code-block:: bash

       npm pack


Deploy backend_obs using FunctionGraph console
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function

 - Create with: **Create from scratch**
 - Function Type: **Event Function**
 - Region: **eu-de/fg-voting-app**
 - Function Name: **backend_obs**
 - Enterprise Project: **default**
 - Agency: **fg-voting-app_backend_obs**
 - Runtime: **Node.js 20.15**

In **Code** tab, section **Code Source** click `Upload -> Local Zip` and upload `functiongraph-backend-obs-1.0.0.zip`.


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

    .. literalinclude:: ../../../backend_obs/resources/test_event.json
  

Executing test form the FunctionGraph console will store the data in path `/test` of the OBS bucket.
