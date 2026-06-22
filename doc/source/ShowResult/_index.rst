.. _ref_showresult:

FunctionGraph ShowResult Event Function
============================================

Example of a Node.js 20.15 Event function with an APIG trigger for
T Cloud Public FunctionGraph that returns the results of the VoteApp.

It reads vote objects from OBS storage and normalizes 1-5 star vote counts for analytics.
The UI renders the rating as D3.js bar chart and
additionally displays a sortable details table for granular review.

Screenshot of the UI
---------------------

.. thumbnail:: ../../../screenshots/showresults.png
   :width: 400px
   :alt: Sample ShowResult
   :title: Sample ShowResult


Prerequisites
------------------

Following project will be used in deployment: 

- **eu-de_fg-voting-app** (see: :ref:`ref_project`)

Deploy following FunctionGraph functions first:

- `backend_obs`, see: :ref:`ref_backend_obs`
- `VoteApp`, see: :ref:`ref_voteapp`

Additionally, the following resource must exist in the same region before deploying the function:

- API-Gateway: **apig-fg-voting-app** (see: :ref:`ref_apigateway`)

Create following LogGroup and LogStream in project **eu-de_fg-voting-app**
(if not exist yet):

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**
- In this log group, create a log stream with:

  - Log Stream Name: **lts-stream-showresult** 

Deploy ShowResult to T Cloud Public FunctionGraph
-----------------------------------------------------

Prepare deployment for ShowResult
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. Install dependencies
 
   .. code-block:: bash

      npm install

2. Create the deployment ZIP from the project root:
 
    .. code-block:: bash

       npm pack


Deploy ShowResult using FunctionGraph console
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function

 - Create with: **Create from scratch**
 - Function Type: **Event Function**
 - Region: **eu-de/fg-voting-app**
 - Function Name: **showResult**
 - Enterprise Project: **default**
 - Agency: **fg-voting-app_backend_obs**
 - Runtime: **Node.js 20.15**


In **Code** tab, section **Code Source** click `Upload -> Local Zip` and upload `functiongraph-showresult-1.0.0.zip`.

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