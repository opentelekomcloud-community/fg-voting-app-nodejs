variable "fg_voteapp_zip_file" {
  description = "ZIP file for the VoteApp function"
  type        = string
  default     = "../VoteApp/functiongraph-voteapp-1.0.0.zip"
}

##########################################################
# Create Function fg_voteapp
##########################################################
resource "opentelekomcloud_fgs_function_v2" "fg_voteapp" {
  name = format("%s_%s_%s", var.prefix, var.appname, "voteapp")
  app  = "default"

  agency = opentelekomcloud_identity_agency_v3.agency_voteapp.name
  
  handler = "bootstrap"

  runtime = "http"

  code_type     = "zip"
  func_code     = filebase64(format("${path.module}/%s", var.fg_voteapp_zip_file))
  code_filename = basename(var.fg_voteapp_zip_file)

  description      = format("VoteApp function for %s", var.appname)
  memory_size      = 512
  timeout          = 30
  max_instance_num = 1

  enable_auth_in_header = true

  log_group_id   = opentelekomcloud_lts_group_v2.MainLogGroup.id
  log_group_name = opentelekomcloud_lts_group_v2.MainLogGroup.group_name

  log_topic_id   = opentelekomcloud_lts_stream_v2.LogStream_voteapp.id
  log_topic_name = opentelekomcloud_lts_stream_v2.LogStream_voteapp.stream_name

  # set environment variables
  user_data = jsonencode({
    "BACKEND_FG_URN" : opentelekomcloud_fgs_function_v2.fg_backend_obs.urn,
    "TITLE": "Welcome to the Voting App"
  })

  tags = {
    "app_group" = var.tag_app_group
  }

}

output "fg_voteapp_URN" {
  value = opentelekomcloud_fgs_function_v2.fg_voteapp.urn
}

output "fg_voteapp_VERSION" {
  value = opentelekomcloud_fgs_function_v2.fg_voteapp.version
}

resource "opentelekomcloud_fgs_event_v2" "fg_voteapp_test_event_health" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_voteapp.urn
  name         = "health_check"
  content = base64encode(jsonencode({
    "httpMethod": "GET", 
    "path": "/health",
    "isBase64Encoded": true
  }))
}

resource "opentelekomcloud_fgs_event_v2" "fg_voteapp_test_event_root" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_voteapp.urn
  name         = "root"
  content = base64encode(jsonencode({
    "httpMethod": "GET",
    "path": "/",
    "isBase64Encoded": true
  }))
}

resource "opentelekomcloud_fgs_event_v2" "fg_voteapp_test_event_r1" {
  function_urn = opentelekomcloud_fgs_function_v2.fg_voteapp.urn
  name         = "rating_5"
  content = base64encode(jsonencode({
    "body": base64encode(jsonencode({"rating": 5, "feedback": "nice"})),
    "httpMethod": "POST",
    "path": "/vote",
    "isBase64Encoded": true
  }))
}
