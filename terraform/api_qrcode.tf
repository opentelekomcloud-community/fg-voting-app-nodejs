resource "opentelekomcloud_apigw_api_v2" "api_qrcode" {

  # TRIGGER-INSTANCE_id
  gateway_id = local.API_GATEWAY_INSTANCE_ID

  # TRIGGER-GROUP_id
  group_id = opentelekomcloud_apigw_group_v2.group1.id

  # TRIGGER-Name
  name = replace(format("%s_%s_apig_trigger_qrcode", var.prefix, var.appname), "-", "_")

  # TRIGGER-TYPE:1
  type = "Public"

  # TRIGGER-PROTOCOL: HTTPS
  request_protocol = "HTTPS"

  # TRIGGER-REG_METHOD: HTTPS
  request_method = "GET"

  # TRIGGER-PATH
  request_uri = "/qrcode"

  # TRIGGER-AUTH: NONE
  security_authentication_type = "NONE"

  # TRIGGER-MATCH_MODE: SWA
  match_mode       = "PREFIX"

  success_response = "Success response"
  failure_response = "Failed response"
  description      = format("Created by script for %s-%s-%s", var.prefix, var.appname, "qrcode")

  func_graph {
    function_urn    = opentelekomcloud_fgs_function_v2.fg_qrcode.urn
    version         = "latest"
    timeout         = 5000
    invocation_type = "sync"
    network_type    = "NON-VPC"
  }

}

##########################################################
# Publish API to specific environment
##########################################################
resource "opentelekomcloud_apigw_api_publishment_v2" "qrcode_default" {
  gateway_id     = local.API_GATEWAY_INSTANCE_ID
  environment_id = local.ENV_ID
  api_id         = opentelekomcloud_apigw_api_v2.api_qrcode.id
  version_id     = opentelekomcloud_apigw_api_v2.api_qrcode.version
}


output "QRCODE_URL" {
  description = "The URL of the API Gateway triggering the FunctionGraph function"
  value       = format("https://%s.apic.%s.otc.t-systems.com/qrcode", 
                opentelekomcloud_apigw_group_v2.group1.id , 
                opentelekomcloud_apigw_group_v2.group1.region)
}