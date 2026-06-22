
variable "fg_showresult_zip_file" {
  description = "ZIP file for the ShowResult function"
  type        = string
  default     = "../ShowResult/functiongraph-showresult-1.0.0.zip"
}

##########################################################
# Create Function fg_showresult
##########################################################
resource "opentelekomcloud_fgs_function_v2" "fg_showresult" {
  # depends_on       = [opentelekomcloud_obs_bucket_object.code_object]
  name    = format("%s_%s_%s", var.prefix, var.appname, "showresult")
  app     = "default"
  agency  = opentelekomcloud_identity_agency_v3.agency_obs_access.name
  handler = "index.handler"

  runtime          = "Node.js20.15"

  code_type = "zip"
  func_code = filebase64(format("${path.module}/%s", var.fg_showresult_zip_file))
  code_filename = basename(var.fg_showresult_zip_file)

  description      = format("ShowResult function for %s", var.appname)
  memory_size      = 512
  timeout          = 30
  max_instance_num = 1

  log_group_id   = opentelekomcloud_lts_group_v2.MainLogGroup.id
  log_group_name = opentelekomcloud_lts_group_v2.MainLogGroup.group_name

  log_topic_id   = opentelekomcloud_lts_stream_v2.LogStream_showresult.id
  log_topic_name = opentelekomcloud_lts_stream_v2.LogStream_showresult.stream_name

  # set environment variables
  user_data = jsonencode({
    "OBS_BUCKET_NAME" : opentelekomcloud_s3_bucket.votebucket.bucket,
    "OBS_ENDPOINT" : "https://obs.otc.t-systems.com",
  })

  tags = {
    "app_group" = var.tag_app_group
  }

}

output "fg_showresult_URN" {
  value = opentelekomcloud_fgs_function_v2.fg_showresult.urn
}

output "fg_showresult_VERSION" {
  value = opentelekomcloud_fgs_function_v2.fg_showresult.version
}
