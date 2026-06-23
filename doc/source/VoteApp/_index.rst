.. _ref_voteapp:

FunctionGraph VoteApp Http Function
==========================================================

Example of a simple Node.js 20.15 app deployed as http function with an APIG trigger on T Cloud Public FunctionGraph.

The app provides:

- a five-star rating input
- a feedback field
- server-side validation & processing 


For code see: :github_repo_master:`VoteApp <VoteApp>` on GitHub.

Screenshot of the UI
---------------------
 
.. thumbnail:: ../../../screenshots/voteapp.png
   :width: 400px
   :alt: Sample VoteApp
   :title: Sample VoteApp

What the app does
--------------------

Exposed Endpoints:

- **GET /** serves the voting page.
- **POST /vote** accepts JSON in the shape `{ "rating": 1-5, "feedback": "..." }`.
- **GET /health** returns a simple health response.
- **GET /favicon.ico** return Favicon.

Handling of incoming votes:

- successful votes are forwarded to :ref:`ref_backend_obs` which stores votes in OBS bucket objects.
  

The examples includes FunctionGraph invoke methods either using

- sending signed requests with **SecurityAccessKey/SecuritySecretKey/SecurityToken** and `API Request signing SDK for NodeJS <https://github.com/opentelekomcloud-community/otc-api-sign-sdk-nodejs>`_ or
- sending requests using **Token** based authentication.


Prerequisites
--------------------

Following project will be used in deployment: 

- **eu-de_fg-voting-app** (see: :ref:`ref_project`)

Create an agency using IAM console with following settings:

- Agency Name: **fg-voting-app_voteapp**
- Agency Type: **Cloud Service**
- Cloud Service: **FunctionGraph**
- Validity Period: **Unlimited**
- Description: **Agency for FG Function backend_obs**
- Permissions:
  - `FunctionGraph CommonOperations`
  - Scope: **All resources**


Create following LogGroup and LogStream in project **eu-de_fg-voting-app**
(if not exist yet):

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**
- In this log group, create a log stream with:

  - Log Stream Name: **lts-stream-voteapp** 

Deploy FunctionGraph `backend_obs` as described in:

- :ref:`ref_backend_obs` 

Additionally, the following resource must exist in the same region before deploying the function:

- API-Gateway: **apig-fg-voting-app** (see: :ref:`ref_apigateway`)

Run VoteApp locally
-------------------

Use Node.js 20.15.1.

.. note::

    This project uses the package [otc-api-sign-sdk-nodejs](https://github.com/opentelekomcloud-community/otc-api-sign-sdk-nodejs) for request signing hosted on GitHub.

    In `package.json` this is included

    .. code-block:: json
        
       "dependencies": {    
            "otc-api-sign-sdk-nodejs":"npm:@opentelekomcloud-community/otc-api-sign-sdk-nodejs@^1.0.0"
       }

        
    For details on how to use GitHub Packages, see [Installing a package](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package).

    if this is not working for you e.g. due to lack of PAT, change this to.

    .. code-block:: json
        
       "dependencies": {    
            "otc-api-sign-sdk-nodejs": "github:opentelekomcloud-community/otc-api-sign-sdk-nodejs#v1.0.0"
       }
       

    this will source the repository with tag v1.0.0 as dependencies.

.. code-block:: bash

   npm install


.. code-block:: bash

   npm start


Open `http://127.0.0.1:8000 <http://127.0.0.1:8000>`_ in browser to view the UI. (Clicking "Submit vote" is only working if deployed to FunctionGraph)

Deploy VoteApp to T Cloud Public FunctionGraph
-----------------------------------------------

Prepare deployment for VoteApp
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

1. Make sure the `bootstrap` file is executable:

   .. code-block:: bash
       
      chmod +x bootstrap
   

2. Create the deployment ZIP from the project root:

    .. code-block:: bash

       npm pack
    

   
Deploy VoteApp to FunctionGraph console
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function:

- Create with: **Create from scratch**
- Function Type: **HTTP Function**
- Region: **eu-de/fg-voting-app**
- FunctionName: **voteApp**
- Enterprise Project: **default**
- Agency: **fg-voting-app_voteapp**

In **Code** tab, section **Code Source** click `Upload -> Local Zip` and upload `functiongraph-vote-app-1.0.0.zip` on the code page.

Configure function:

- `Logs`

    - Collect Logs: **enable**
    - Log Group: **lts-group-fg-voting-app**
    - Log Stream: **lts-stream-voteapp**

- `Environment variables` (Optional, defaults are shown here)

    - **BACKEND_FG_URN** = **[URN from backend_obs functiongraph]**
    - **TITLE** = **FunctionGraph Demo**

- `Advanced Settings`

    - Include Keys: **enable** 

- `Triggers`

   * Trigger type: **API Gateway (Dedicated)**
   * API Instance: **apig-fg-voting-app**
   * API Name: **API_voteApp**
   * API Group: **DEFAULT**
   * Environment: **RELEASE**
   * Security Authentication: **None**
   * Protocol: **HTTPS**
   * Method: **ANY**
   * Timeout: **5000**


Testing using test events
------------------------------

Create test events:

- **Name:** ui

  .. literalinclude:: ../../../VoteApp/resources/event_root.json
     :caption: Payload

- **Name:** health  
  
  .. literalinclude:: ../../../VoteApp/resources/event_health.json
     :caption: Payload

- **Name:** vote_5star 
  
  .. literalinclude:: ../../../VoteApp/resources/event_vote_5star.json
     :caption: Payload

  The value of body  `eyJyYXRpbmciOiA1LCAiZmVlZGJhY2siOiAibmljZSJ9` in this event is base64 encoded string of `{"rating": 5, "feedback": "nice"}`

Click `Test` for each single created event and you will see output in `Execution Result` tab (The value of body is base64 encoded).  
For vote_5star you will find an OBS object in OBS bucket in folder **/vote**.

Testing using browser
------------------------------

After deployment, open the generated trigger URL and submit a vote using UI - another object in OBS bucket in folder **/vote** will be created.


Packaging notes for FunctionGraph HTTP functions
------------------------------------------------------------

- The app listens on port `8000`, which matches FunctionGraph HTTP function expectations.
- The `bootstrap` file starts the app with the Node.js 20.15 runtime path documented by FunctionGraph.
- Keep `package.json` and `bootstrap` at the root of the ZIP file.
