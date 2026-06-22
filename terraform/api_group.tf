locals {
  API_GATEWAY_INSTANCE_ID = var.API_GATEWAY_INSTANCE_ID
  ENV_NAME                = "RELEASE"
  ENV_ID                  = "DEFAULT_ENVIRONMENT_RELEASE_ID"
}

##########################################################
# opentelekomcloud_apigw_group_v2.group
##########################################################
resource "opentelekomcloud_apigw_group_v2" "group1" {
  # depends_on = [ opentelekomcloud_fgs_function_v2.MyFunction ]
  name        = replace(format("%s_%s_api_group", var.prefix, var.appname), "-", "_")
  instance_id = local.API_GATEWAY_INSTANCE_ID
  description = format("API Group for %s, %s", var.prefix, var.appname)
}

output "API_GATEWAY_TRIGGER_URL" {
  description = "The URL of the API Gateway triggering the FunctionGraph function"
  value       = format("https://%s.apic.%s.otc.t-systems.com", 
                opentelekomcloud_apigw_group_v2.group1.id , 
                opentelekomcloud_apigw_group_v2.group1.region)
  
}