.. _ref_apigateway:

API Gateway: apig-fg-voting-app
=================================


This sample is assumed to use an API Gateway in project **eu-de_fg-voting-app** named **apig-fg-voting-app**.

You can create a new API Gateway in the API Gateway console or use an existing one.

If you use an existing project, make sure to use this during deployment of all resources.


Create API Gateway
-------------------

In API Gateway console, switch to project **eu-de_fg-voting-app**
and click `Create Dedicated Gateway` with following settings:

- Region: **eu-de_fg-voting-app**
- AZ: **eu-de-01**
- Gateway-Name: **apig-fg-voting-app**
- Edition: **Basic**
- Enterprise Project: **default**
- Public Inbound Access: **Enabled: checked**

- Public Outbound Access: **Enabled: checked**

- VPC: **vpc-fg-voting-app**, **subnet-fg-voting-app**
  Create new, if it does not exist:

  - Region: **eu-de_fg-voting-app**
  - Name: **vpc-fg-voting-app**
  - IPv4 CIDR Block: use default values
  - Enterprise Project: **default**
  - Default Subnet:
  - Name: **subnet-fg-voting-app**
  - IPv4 CIDR Block: use default values
  - Security Group: **default**

