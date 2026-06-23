.. _ref_qrcode:

FunctionGraph QRCode Event Function
=====================================

Example of a Node.js 20.15 event function with an APIG trigger 
for T Cloud Public FunctionGraph that returns a QR code PNG for a given URL.

For QR code generation in this sample the npm package `node-qrcode <https://github.com/soldair/node-qrcode>`_ is used.

For code see: :github_repo_master:`QRCode <QRCode>` on GitHub.

Screenshot of the UI
---------------------

.. thumbnail:: ../../../screenshots/qrcode.png
   :width: 200px
   :alt: Sample QR code
   :title: Sample QR code

Overview
-----------------

Event input is a simplified APIG Event:

.. code-block:: json

    {
      "queryStringParameters": {
        "url": "https://example.apic.eu-de.otc.t-systems.com/"
        "width": "256"
      },
      "httpMethod": "GET",
      "path": "/"
    }


`width` can be optionally provided as query parameter, e.g. `/?url=https://example.com&width=256`

Response
""""""""

Successful execution returns:

- `statusCode: 200`
- `headers["Content-Type"] = "image/png"`
- `isBase64Encoded: true`
- `body` containing the PNG bytes encoded as base64

If the input is missing or invalid, the function returns `statusCode: 400` with a JSON error payload.

Local test
-----------

Local setup
""""""""""""""""

.. code-block:: bash

   npm install


Test local:

.. code-block:: bash

   npm run test:invoke



Deployment to T Cloud Public
--------------------------------

Prerequisites
------------------

Following project will be used in deployment: 

- **eu-de_fg-voting-app** (see: :ref:`ref_project`)

Following FunctionGraph functions need to deployed first:

- VoteApp see: :ref:`ref_voteapp`

Additionally, the following resource must exist in the same region before deploying the function:

- API-Gateway: **apig-fg-voting-app** (see: :ref:`ref_apigateway`)

Create following LogGroup and LogStream in project **eu-de_fg-voting-app**
(if not exist yet):

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**
- In this log group, create a log stream with:

   - Log Stream Name: **lts-stream-qrcode** 


Deploy QRCode to T Cloud Public FunctionGraph
-----------------------------------------------------

Prepare deployment for QRCode
"""""""""""""""""""""""""""""""

1. Install dependencies
 
   .. code-block:: bash

      npm install

2. Create the deployment ZIP from the project root:
 
    .. code-block:: bash

       npm pack



Deploy QRCode using FunctionGraph console
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function
 - Create with: **Create from scratch**
 - Function Type: **Event Function**
 - Region: **eu-de/fg-voting-app**
 - Function Name: **qrcode**
 - Enterprise Project: **default**
 - Agency: **Use no agency**
 - Runtime: **Node.js 20.15**


In **Code** tab, section **Code Source** click `Upload -> Local Zip` and upload `functiongraph-qrcode-1.0.0.zip`.

Configure function:
  - `Basic Settings`
    - Handler: **index.handler**

  - `Logs`
     - Collect Logs: **enable**
     - Log Group: **lts-group-fg-voting-app**
     - Log Stream: **lts-stream-qrcode**

  - `Environment Variables`
    - defaultPNGWidth = 150 (optional)

  - `Triggers`  
   
    * Trigger type: **API Gateway (Dedicated)**
    * API Instance: **apig-fg-voting-app**
    * API Name: **API_qrcode**
    * API Group: **DEFAULT**
    * Environment: **RELEASE**
    * Security Authentication: **None**
    * Protocol: **HTTPS**
    * Method:   **GET**
    * Timeout: **5000**
    

After trigger creation, use the displayed URL in browser, like:

https://ff3f80b40b09420195f99d9c5d645828.apic.eu-de.otc.t-systems.com/qrcode?url=https://www.google.de

where `https://ff3f80b40b09420195f99d9c5d645828.apic.eu-de.otc.t-systems.com` is the displayed URL in API trigger.


Test QRCode function in console
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

You can also test the function in console:

- Click on `Test`
- Create a new test event of type **API Gateway (Dedicated)** 
- name it as you like
- use content of file [resources/test_event.json](resources/test_event.json) as payload
- click `Create`

To test, click on `Test` and in `Execution Result` tab you sould see output like:

.. code-block:: json

    {
      "statusCode": 200,
      "isBase64Encoded": true,
      "headers": {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
        "Content-Disposition": "inline; filename=\"qrcode.png\""
      },
      "body": "iVBOR ... =="
    }

*(Remark: the body value in above example is shortened)*

The body value contains the base64 encoded qrcode png file. Encoded in the QR code is the url passed as a url query parameter of the GET request.

You can use this value, eg. in `Base64 Guru - Base64 to PNG   <https://base64.guru/converter/decode/image/png>`_ to verify the result.
