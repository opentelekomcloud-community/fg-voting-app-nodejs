variable "fg_qrcode_zip_file" {
  description = "ZIP file for the QRCode function"
  type        = string
  default     = "../QRCode/functiongraph-qrcode-1.0.0.zip"
}

##########################################################
# Create Function fg_qrcode
##########################################################
resource "opentelekomcloud_fgs_function_v2" "fg_qrcode" {
  # depends_on       = [opentelekomcloud_obs_bucket_object.code_object]
  name = format("%s_%s_%s", var.prefix, var.appname, "qrcode")
  app  = "default"

  handler = "index.handler"

  runtime = "Node.js20.15"

  code_type     = "zip"
  func_code     = filebase64(format("${path.module}/%s", var.fg_qrcode_zip_file))
  code_filename = basename(var.fg_qrcode_zip_file)

  description      = format("QRCode function for %s", var.appname)
  memory_size      = 512
  timeout          = 30
  max_instance_num = 1

  log_group_id   = opentelekomcloud_lts_group_v2.MainLogGroup.id
  log_group_name = opentelekomcloud_lts_group_v2.MainLogGroup.group_name

  log_topic_id   = opentelekomcloud_lts_stream_v2.LogStream_qrcode.id
  log_topic_name = opentelekomcloud_lts_stream_v2.LogStream_qrcode.stream_name

  # set environment variables
  user_data = jsonencode({
    "defaultPNGWidth" : "150",
    "defaultUrl" : format("https://%s.apic.%s.otc.t-systems.com/",
      opentelekomcloud_apigw_group_v2.group1.id,
    opentelekomcloud_apigw_group_v2.group1.region)
  })

  tags = {
    "app_group" = var.tag_app_group
  }

}

output "fg_qrcode_URN" {
  value = opentelekomcloud_fgs_function_v2.fg_qrcode.urn
}

output "fg_qrcode_VERSION" {
  value = opentelekomcloud_fgs_function_v2.fg_qrcode.version
}
