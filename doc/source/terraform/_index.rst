Deploy using Terraform
========================

.. toctree::
   :maxdepth: 1
   :hidden:

   setuptf

This section describes how to deploy the application using Terraform.

Prerequisites
----------------

Operating system
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This sample was developed and tested using:

 -  Windows Subsystem for Linux (WSL)


API Gateway
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
This sample assumes that an **API Gateway** in the same **project and region** is already created
and there is an environment variable **TF_VAR_API_GATEWAY_INSTANCE_ID**
with the API Gateway instance id set.


Set up Terraform
----------------

Set up terraform as described in :ref:`ref_terraform_setup`.


Deploying using Terraform and make
----------------------------------

Following makefile can be used to deploy the function to FunctionGraph using Terraform.

.. literalinclude:: ../../../Makefile
  :language: make
  :caption: Makefile
  :tab-width: 2

Makefile targets:

- ``build``: creates the deployment package as zip file using npm pack for all functions.
- ``tf_init``: initializes terraform, this will create the terraform state file in the defined backend.
- ``tf_plan``: runs terraform plan to see which changes will be applied.
- ``tf_apply``: runs terraform apply to deploy the function to FunctionGraph.
- ``tf_destroy``: runs terraform destroy to remove the deployed infrastructure.


Adaptions
^^^^^^^^^^^^

Adaptions in Makefile
""""""""""""""""""""""""""""
Before running the targets in the makefile,
make sure to 

Adapt the **BACKEND_CONFIG_*** variables in the Makefile

.. list-table:: Backend config variables
  :header-rows: 1

  * - Variable
    - Description
    - Example value
  * - BACKEND_CONFIG_BUCKET
    - The name of the bucket where terraform state is stored
    - doc-samples-tf-backend
  * - BACKEND_CONFIG_KEY
    - The name of the object(key) where terraform state is stored
    - terraform_state/va-voteapp/voteapp.tf
  * - BACKEND_CONFIG_REGION
    - The region where the bucket for terraform state is stored is located
    - eu-de
  * - BACKEND_CONFIG_ENDPOINTS
    - The OBS endpoints for the bucket where terraform state is stored
    - endpoints={s3=\"https://obs.eu-de.otc.t-systems.com\"}
    
Adaptions in variables.tfvars
""""""""""""""""""""""""""""""  
Adapt the variables in the ``variables.tfvars``

.. literalinclude:: ../../../terraform/variables.tfvars
  :language: hcl
  :caption: variables.tfvars
  :tab-width: 2

Deployment to T Cloud Public
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
After the necessary adaptions are done, you can run the following command to deploy the function to
FunctionGraph:

.. code-block:: bash

   make tf_apply

