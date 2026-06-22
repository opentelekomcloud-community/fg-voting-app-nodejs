# fg-voting-app-nodejs


A simple example application demonstrating usage of FunctionGraph functions written in Node.JS on T Cloud Public.

For complete documentation see: [fg-voting-app-nodejs](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/backend_obs/_index.html)

For details on FunctionGraph functions written in Node.JS, see
[FunctionGraph Node.JS Developer Guide](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/#).


## What is demonstrated

- creating FunctionGraph HTTP function
- creating FunctionGraph Event function
- FunctionGraph functions using APIG triggers
- calling FunctionGraph function using signed requests with SecuritsAccessKey/SecuritySecretKey/SecurityToken
- calling FunctionGraph function using Token
- accessing OBS buckets
- packaging functions for deployment
- deploying using terraform scripts

## Overview

![image](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/_images/overview.drawio.svg)

### backend_obs

FunctionGraph function of type Event Function responsible for persisting votes in an OBS Bucket.
Individual votes are written as OBS Objects as single json files.

For details and installation see: [backend_obs](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/backend_obs/_index.html)

### VoteApp

FunctionGraph function of type HTTP Function using the Node.js included HTTP module to create the HTTP server.
The function is triggered by an APIG trigger.  
It's the primary user interface for voting:


<img src="./screenshots/voteapp.png" alt="drawing" width="200"/>


Following Endpoints are provided:

- **GET /**  
  Endpoint for delivering the UI

- **POST /vote**  
  Endpoint for capturing votes.
  It invokes backend_obs via signed requests 
  using temporary credentials retrieved from an
  agency.

- **GET /health**  
  Endpoint for monitoring.

- **GET /favicon.ico**  
  Returns favicon.  

For details and installation see: [VoteApp](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/VoteApp/_index.html)

### QRCode

FunctionGraph function of type Event Function triggered by an APIG trigger.
This function delivers an QR Code for opening the VoteApp.

<img src="./screenshots/qrcode.png" alt="drawing" width="200"/>

For details and installation see: [QRCode](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/QRCode/_index.html)

## ShowResult

FunctionGraph function of type Event Function triggered by an APIG trigger.
This function is for data visualization and reporting.

<img src="./screenshots/showresults.png" alt="drawing" width="200"/>

It reads vote objects from OBS storage and normalizes 1-5 star vote counts for analytics.
The UI renders the rating as D3.js bar chart and
additionally displays a sortable details table for granular review.

For details and installation see: [ShowResult](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/ShowResult/_index.html)

## Prerequisites

See: [Prerequisites](https://opentelekomcloud-community.github.io/fg-voting-app-nodejs/prerequisites/_index.html)


> Warranty Disclaimer
> -------------------
> THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT
> WILL BE USEFUL,BUT WITHOUT ANY WARRANTY; WITHOUT EVEN THE IMPLIED WARRANTY
> OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE.
> 
> SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
