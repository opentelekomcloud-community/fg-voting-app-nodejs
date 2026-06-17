# ShowResult

Example of a Node.js 20.15 event function with an APIG trigger 
for T Cloud Public FunctionGraph that returns the results of the VoteApp.

# Prerequisites

## Deployed FunctionGraphs 'backend_obs', 'VoteApp'

Following FunctionGraph functions need to deployed first:

- backend_obs, see: [../backend_obs/README.md](../backend_obs/README.md)
- HttpVoteApp see: [../VoteApp/README.md](../VoteApp/README.md)

### LogGroup and LogStream created

In project **eu-de_fg-voting-app**, create a log group using LTS console with following settings (if loggroup does not exist yet):

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**

In this log group, create a log stream with:
- Log Stream Name: **lts-stream-showresult** 

## Deploy to to T Cloud Public FunctionGraph

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function
 - Create with: **Create from scratch**
 - Function Type: **Event Function**
 - Region: **eu-de/fg-voting-app**
 - Function Name: **showResult**
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
    - Log Stream: **lts-stream-showresult**
  - `Environment variables` (Optional, defaults are shown here)
    - OBS_ENDPOINT = https://obs.eu-de.otc.t-systems.com
    - OBS_BUCKET_NAME = fg-voting-app-votes

In **Configuration** tab -> **Triggers**:
- Click `Create Trigger`
- Configure an APIG trigger for public HTTP access with
   
    * Trigger type: **API Gateway (Dedicated)**
    * API Instance: **apig-fg-voting-app**
    * API Name: **API_showResult**
    * API Group: **DEFAULT**
    * Environment: **RELEASE**
    * Security Authentication: **None**
    * Protocol: **HTTPS**
    * Method:   **GET**
    * Timeout: **5000**

After trigger creation, use the displayed URL in browser, like:
   https://ff3f80b40b09420195f99d9c5d645828.apic.eu-de.otc.t-systems.com/showResult

   where `https://ff3f80b40b09420195f99d9c5d645828.apic.eu-de.otc.t-systems.com` is the displayed URL.