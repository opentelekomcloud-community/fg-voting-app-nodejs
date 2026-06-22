.. _ref_terraform_setup:

Prepare the Terraform/OpenTofu environment
-------------------------------------------

.. toctree::
   :maxdepth: 2
   :hidden:

Installing Terraform/OpenTofu
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Terraform/OpenTofu provides installation packages for different environments.

For details, see 

- `Install Terraform <https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli>`_ on Terraform site.
- `Install OpenTofu <https://opentofu.org/docs/intro/install/>`_ on OpenTofu site.

For details on how to use the OpenTelekomCloud Terraform provider, see

- `Open Telekom Cloud Provider on Terraform <https://registry.terraform.io/providers/opentelekomcloud/opentelekomcloud/latest/docs>`_.
- `Open Telekom Cloud Provider on OpenTofu <https://search.opentofu.org/provider/hashicorp/opentelekomcloud/latest>`_

Setting Environment Variables
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
Set following environment variables:

  .. list-table:: Environment variables
      :widths: 20 20 25
      :header-rows: 1

      * - Name
        - Value
        - Remark

      * - TF_VAR_OTC_SDK_AK
        - Access key
        - see: :api_usage:`Generating an AK and SK<guidelines/calling_apis/ak_sk_authentication/generating_an_ak_and_sk.html>` in API usage guide.

      * - TF_VAR_OTC_SDK_SK
        - Secret key
        - see: :api_usage:`Generating an AK and SK<guidelines/calling_apis/ak_sk_authentication/generating_an_ak_and_sk.html>` in API usage guide.

      * - TF_VAR_OTC_SDK_DOMAIN_NAME
        - Domain Name
        - see: :api_usage:`Obtaining the Domain Name and Domain ID<guidelines/calling_apis/obtaining_required_information.html>` in API usage guide.

      * - TF_VAR_OTC_SDK_PROJECTID
        - Project Id
        - see: :api_usage:`Obtaining a Project ID<guidelines/calling_apis/obtaining_required_information.html>` in API usage guide.

      * - TF_VAR_OTC_SDK_PROJECTNAME
        - Project name
        - see: :api_usage:`Obtaining a Project ID<guidelines/calling_apis/obtaining_required_information.html>` in API usage guide.

      * - TF_VAR_OTC_IAM_ENDPOINT
        - IAM endpoint URL
        - e.g. *https://iam.eu-de.otc.t-systems.com*

      * - AWS_ACCESS_KEY_ID
        - set to ``OTC_SDK_AK``
        - Needed for backend "s3" state.

      * - AWS_SECRET_ACCESS_KEY
        - set to ``OTC_SDK_SK``
        - Needed for backend "s3" state.

      * - AWS_REQUEST_CHECKSUM_CALCULATION
        - "when_required"
        - needed for Terraform version > 1.11.1 (*)

      * - AWS_RESPONSE_CHECKSUM_VALIDATION
        - "when_required"
        - needed for Terraform version > 1.11.1 (*)

(*) see: `Remote State OBS <https://community.open-telekom-cloud.com/community?id=community_question&sys_id=1207be61138086d0d15a246ea6744162&view_source=searchResult>`_
, `AWS CLI supported environment variables <https://docs.aws.amazon.com/cli/v1/userguide/cli-configure-envvars.html#envvars-list>`_

.. note:: **Simplify Environment variables handling for Terraform**

    As Terraform can only access environment variables starting with ``TF_VAR_``
    you can use follow script to transform ``OTC_*`` variables to
    ``TF_VAR_OTC_*`` variables:

    .. code-block:: bash

      #!/bin/bash

      # get all env variables starting with "OTC_" and prepend with "TF_VAR_"
      for var in "${!OTC_@}"; do
          export $(printf 'TF_VAR_%s=%s\n' "$var" "${!var}")
      done

      # for provider configuration set AK/SK to be used.
      export AWS_ACCESS_KEY_ID=$OTC_SDK_AK
      export AWS_SECRET_ACCESS_KEY=$OTC_SDK_SK

      # configure terraform s3 backend to work with obs
      # https://community.open-telekom-cloud.com/community?id=community_question&sys_id=1207be61138086d0d15a246ea6744162&view_source=searchResult
      export AWS_REQUEST_CHECKSUM_CALCULATION=when_required
      export AWS_RESPONSE_CHECKSUM_VALIDATION=when_required

    You can run this script before running ``terraform init`` to set the environment variables.


Configure ``provider.tf`` file
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

For terraform provider configuration create a file like the following.

Adapt values for:

* ``bucket`` - this is the bucket for terraform state files
* ``key`` - this is the path and name in the bucket of the terraform state file
* ``s3``  - configure OBS endpoint according to your tenant

.. literalinclude:: ../../../terraform/provider.tf
   :language: terraform
   :caption: provider.tf


Backend state bucket
^^^^^^^^^^^^^^^^^^^^

Terraform must store state about your managed infrastructure and configuration.
This state is used by Terraform to map real world resources to your configuration,
keep track of metadata, and to improve performance for large infrastructures.

See: `Terraform State <https://developer.hashicorp.com/terraform/language/state>`_

.. note::

   As you cannot create the state bucket in this terraform setup,
   you have to create it either:

   * using OBS console with bucket name as defined in ``provider.tf`` file for ``bucket``.

   * using the CLI with command `s3cmd <https://s3tools.org/s3cmd>`_

     .. code-block:: shell

          s3cmd \
            --access_key=${OTC_SDK_AK} \
            --secret_key=${OTC_SDK_SK} \
            --host=https://obs.eu-de.otc.t-systems.com \
            --host-bucket="%(bucket)s.obs.eu-de.otc.t-systems.com" \
            --no-ssl \
            mb s3://<bucket_name>
