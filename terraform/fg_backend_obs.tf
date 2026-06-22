
variable "fg_backend_obs_zip_file" {
  description = "ZIP file for the backend OBS function"
  type        = string
  default     = "../backend_obs/functiongraph-backend-obs-1.0.0.zip"
}

##########################################################
# Create Function fg_backend_obs
##########################################################
resource "opentelekomcloud_fgs_function_v2" "fg_backend_obs" {
  depends_on       = [opentelekomcloud_identity_agency_v3.agency_obs_access]
  name    = format("%s_%s_%s", var.prefix, var.appname, "backend_obs")
  app     = "default"
  agency  = opentelekomcloud_identity_agency_v3.agency_obs_access.name
  handler = "index.handler"

  runtime          = "Node.js20.15"

  code_type = "zip"
  func_code = filebase64(format("${path.module}/%s", var.fg_backend_obs_zip_file))
  code_filename = basename(var.fg_backend_obs_zip_file)

  description      = format("OBS backend function for %s", var.appname)
  memory_size      = 512
  timeout          = 30
  max_instance_num = 1

  log_group_id   = opentelekomcloud_lts_group_v2.MainLogGroup.id
  log_group_name = opentelekomcloud_lts_group_v2.MainLogGroup.group_name

  log_topic_id   = opentelekomcloud_lts_stream_v2.LogStream_backend_obs.id
  log_topic_name = opentelekomcloud_lts_stream_v2.LogStream_backend_obs.stream_name

  # set environment variables
  user_data = jsonencode({
    "OBS_BUCKET_NAME" : opentelekomcloud_s3_bucket.votebucket.bucket,
    "OBS_ENDPOINT" : "https://obs.otc.t-systems.com",
  })

  tags = {
    "app_group" = var.tag_app_group
  }

}

output "fg_backend_obs_URN" {
  value = opentelekomcloud_fgs_function_v2.fg_backend_obs.urn
}

output "fg_backend_obs_VERSION" {
  value = opentelekomcloud_fgs_function_v2.fg_backend_obs.version
}

resource "opentelekomcloud_fgs_event_v2" "fg_backend_obs_test_event_r5" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_backend_obs.urn
  name         = "rating_5"
  content = base64encode(jsonencode({
    "rating"= 5
    "feedback"= "Nice work!"
    "submittedAt"= 1776063063502
  }))
}

resource "opentelekomcloud_fgs_event_v2" "fg_backend_obs_test_event_r4" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_backend_obs.urn
  name         = "rating_4"
  content = base64encode(jsonencode({
    "rating"= 4
    "feedback"= "Good work!"
    "submittedAt"= 1776063063502
  }))
}

resource "opentelekomcloud_fgs_event_v2" "fg_backend_obs_test_event_r3" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_backend_obs.urn
  name         = "rating_3"
  content = base64encode(jsonencode({
    "rating"= 3
    "feedback"= "Average work!"
    "submittedAt"= 1776063063502
  }))
}

resource "opentelekomcloud_fgs_event_v2" "fg_backend_obs_test_event_r2" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_backend_obs.urn
  name         = "rating_2"
  content = base64encode(jsonencode({
    "rating"= 2
    "feedback"= "Below average work!"
    "submittedAt"= 1776063063502
  }))
}

resource "opentelekomcloud_fgs_event_v2" "fg_backend_obs_test_event_r1" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_backend_obs.urn
  name         = "rating_1"
  content = base64encode(jsonencode({
    "rating"= 1
    "feedback"= "Poor work!"
    "submittedAt"= 1776063063502
  }))
}