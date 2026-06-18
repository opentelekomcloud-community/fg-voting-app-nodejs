
###########################################################
# Custom role to allow FunctionGraph to access OBS
###########################################################
resource "opentelekomcloud_identity_role_v3" "role_obs_access" {
  display_name  = format("%s-%s-role-obs-access", var.prefix, var.appname)
  description   = "Role for FunctionGraph to access OBS"
  display_layer = "project"

  statement {
    effect = "Allow"
    action = [
      "obs:*:*",
    ]
    resource = [
      "OBS:*:*:object:*",
      format("OBS:*:*:bucket:%s", opentelekomcloud_s3_bucket.votebucket.bucket),
    ]
  }

}

##########################################################
# Agency for FunctionGraph
# Attention: Creating agency will take some time.
# Calls to function after creating agency will fail until
# agency is set up.
##########################################################
resource "opentelekomcloud_identity_agency_v3" "agency_obs_access" {
  depends_on            = [opentelekomcloud_identity_role_v3.role_obs_access]
  delegated_domain_name = "op_svc_cff"

  name        = format("%s-%s-agency-obs-access", var.prefix, var.appname)
  description = "Agency for FunctionGraph to access OBS"

  project_role {
    all_projects = true
    roles = [
      opentelekomcloud_identity_role_v3.role_obs_access.display_name
    ]
  }

}


