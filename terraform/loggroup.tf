##########################################################
# Create Log Group
##########################################################
resource "opentelekomcloud_lts_group_v2" "MainLogGroup" {
  group_name  = format("%s_%s_%s", var.prefix, var.appname, "log_group")
  ttl_in_days = 1

  tags = {
    "app_group" = var.tag_app_group
  }
}

##########################################################
# Create Log Streams
##########################################################
resource "opentelekomcloud_lts_stream_v2" "LogStream_backend_obs" {
  group_id    = opentelekomcloud_lts_group_v2.MainLogGroup.id
  stream_name = format("%s_%s_%s", var.prefix, var.appname, "log_backend_obs")

  tags = {
    "app_group" = var.tag_app_group
  }
}

resource "opentelekomcloud_lts_stream_v2" "LogStream_qrcode" {
  group_id    = opentelekomcloud_lts_group_v2.MainLogGroup.id
  stream_name = format("%s_%s_%s", var.prefix, var.appname, "log_qrcode")

  tags = {
    "app_group" = var.tag_app_group
  }
}

resource "opentelekomcloud_lts_stream_v2" "LogStream_showresult" {
  group_id    = opentelekomcloud_lts_group_v2.MainLogGroup.id
  stream_name = format("%s_%s_%s", var.prefix, var.appname, "log_showresult")

  tags = {
    "app_group" = var.tag_app_group
  }
}

resource "opentelekomcloud_lts_stream_v2" "LogStream_voteapp" {
  group_id    = opentelekomcloud_lts_group_v2.MainLogGroup.id
  stream_name = format("%s_%s_%s", var.prefix, var.appname, "log_voteapp")

  tags = {
    "app_group" = var.tag_app_group
  }
}
