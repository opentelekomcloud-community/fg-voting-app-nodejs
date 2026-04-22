# FunctionGraph Voting App

Example of a simple Node.js 20.15 app deployed as http function with an APIG trigger on T Cloud Public FunctionGraph.

The app provides:

- a five-star rating input
- a feedback field
- server-side validation & processing 
- FunctionGraph-compatible HTTP deployment
- 
## What the app does

- `GET /` serves the voting page.
- `POST /vote` accepts JSON in the shape `{ "rating": 1-5, "feedback": "..." }`.
- `GET /health` returns a simple health response.
- successful votes are written to stdout so they appear in FunctionGraph logs

## Prerequisites

### Project eu-de_fg-voting-app created

Create a project **eu-de_fg-voting-app** as described in [../README.md](../README.md)

### Agency created

Create an agency using IAM console with following settings:

- Agency Name: **fg-voting-app_voteapp**
- Agency Type: **Cloud Service**
- Cloud Service: **FunctionGraph**
- Validity Period: **Unlimited**
- Description: **Agency for FG Function backend_obs**
- Permissions:
  - `FunctionGraph CommonOperations`

### LogGroup and LogStream created

In project **eu-de_fg-voting-app**, create a log group using LTS console with following settings (if not exists):

- Log Group Name: **lts-group-fg-voting-app**
- Log Retention (Days): **1**

In this log group, create a log stream with:
- Log Stream Name: **lts-stream-voteapp** 

### Backend_obs function deployed

see [../backend_obs/README.md](../backend_obs/README.md)

## Local run

Use Node.js 20.15.1.

> [!NOTE]
> This project uses the package [otc-api-sign-sdk-nodejs](https://github.com/opentelekomcloud-community/otc-api-sign-sdk-nodejs) for request signing hosted on GitHub.
>
> In `package.json` this is included 
> ```json
> "dependencies": {    
>    "otc-api-sign-sdk-nodejs":"npm:@opentelekomcloud-community/otc-api-sign-sdk-nodejs@^1.0.0"
>  }
> ```
> For details on how to use GitHub Packages, see [Installing a package](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package).
>
> if this is not working for you, change this to.
> ```json
> "dependencies": {    
>    "otc-api-sign-sdk-nodejs": "github:opentelekomcloud-community/otc-api-sign-sdk-nodejs#v1.0.0"
>  }
> ```
> this will source the repository with tag v1.0.0 as dependencies.



```bash
npm install
```




```bash
npm start
```

Open <http://127.0.0.1:8000> in browser.

## Deploy to T Cloud Public FunctionGraph

### Prepare deployment
1. Make sure the `bootstrap` file is executable:

   ```bash
   chmod +x bootstrap
   ```

2. Create the deployment ZIP from the project root:

    ```bash
    npm pack
    ```

   
### Deploy to FunctionGraph

In project **eu-de_fg-voting-app**, create following FunctionGraph function using FunctionGraph console:

Create function
- Create with: **Create from scratch**
 - Function Type: **HTTP Function**
 - Region: **eu-de/fg-voting-app**
 - FunctionName: **voteApp**
 - Enterprise Project: **default**
 - Agency: fg-voting-app_voteapp

In **Code** tab, section **Code Source** click `Upload -> Local Zip` and upload `functiongraph-voting-app-1.0.0.zip` on the code page.

Configure function:
- `Logs`
    - Collect Logs: **enable**
    - Log Group: **lts-group-fg-voting-app**
    - Log Stream: **lts-stream-voteapp**

- `Environment variables` (Optional, defaults are shown here)
    - BACKEND_FG_URN = [URN from backend_obs functiongraph]
    - TITLE = FunctionGraph Demo

- `Advanced Settings`
    - Include Keys: **enable** 

- `Triggers`
   * Trigger type: **API Gateway (Dedicated)**
   * API Instance: **apig-fg-voting-app**
   * API Name: **API_voteApp**
   * API Group: **DEFAULT**
   * Environment: **Release**
   * Security Authentication: **None**
   * Protocol: **HTTPS**
   * Method: **Any**
   * Timeout: **5000**


## Testing

After deployment, open the generated trigger URL.


## Packaging notes for FunctionGraph

- The app listens on port `8000`, which matches FunctionGraph HTTP function expectations.
- The `bootstrap` file starts the app with the Node.js 20.15 runtime path documented by FunctionGraph.
- Keep `index.js`, `package.json`, and `bootstrap` at the root of the ZIP file.
