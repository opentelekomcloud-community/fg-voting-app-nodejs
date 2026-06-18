SHELL = /bin/bash


# Terraform backend configuration
BACKEND_CONFIG_BUCKET := "doc-samples-tf-backend"
BACKEND_CONFIG_KEY := "terraform_state/va-voteapp/voteapp.tf"
BACKEND_CONFIG_REGION := "eu-de"
BACKEND_CONFIG_ENDPOINTS := "endpoints={s3=\"https://obs.eu-de.otc.t-systems.com\"}"

CURRENT_MAKEFILE := $(firstword $(MAKEFILE_LIST))

build:
	cd backend_obs && npm pack
	cd QRCode && npm pack
	cd VoteApp && npm pack
	cd ShowResult && npm pack

tf_init:
	terraform -chdir=terraform \
	  init \
	  -backend-config=$(BACKEND_CONFIG_ENDPOINTS) \
	  -backend-config="bucket=$(BACKEND_CONFIG_BUCKET)" \
	  -backend-config="key=$(BACKEND_CONFIG_KEY)" \
	  -backend-config="region=$(BACKEND_CONFIG_REGION)"

tf_plan: build
	if [ ! -f "terraform/.terraform.lock.hcl" ]; then \
		$(MAKE) -f $(CURRENT_MAKEFILE) tf_init; \
	fi
	terraform -chdir=terraform \
	  plan \
		-var-file="variables.tfvars" 

tf_apply: build
	if [ ! -f "terraform/.terraform.lock.hcl" ]; then \
		$(MAKE) -f $(CURRENT_MAKEFILE) tf_init; \
	fi
	terraform -chdir=terraform \
	  apply -auto-approve \
	  -var-file="variables.tfvars"

tf_destroy:
	terraform -chdir=terraform \
	  destroy -auto-approve \
		-var-file="variables.tfvars"

# list objects in the vote bucket using s3cmd
list_vote_objects:
	$(eval VOTEBUCKET_NAME := $(shell terraform -chdir=terraform output -raw VoteAppBucketName))
	s3cmd \
	--access_key=$(TF_VAR_OTC_SDK_AK) \
	--secret_key=$(TF_VAR_OTC_SDK_SK) \
	--no-ssl \
	ls s3://$(VOTEBUCKET_NAME)/vote/