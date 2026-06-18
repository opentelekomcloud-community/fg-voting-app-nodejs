###########################################################
# Custom role to allow FunctionGraph to invoke functions
###########################################################
resource "opentelekomcloud_identity_role_v3" "role_fg_invoke" {
  display_name  = format("%s-%s-role-fg-invoke", var.prefix, var.appname)
  description   = "Role for FunctionGraph to invoke functions"
  display_layer = "project"

  statement {
    effect = "Allow"
    action = [
      "functiongraph:function:invoke*",
    ]    
  }

}


resource "opentelekomcloud_identity_agency_v3" "agency_voteapp" {
  depends_on            = [opentelekomcloud_identity_role_v3.role_fg_invoke]
  delegated_domain_name = "op_svc_cff"

  name        = format("%s-%s-agency-fg-invoke", var.prefix, var.appname)
  description = "Agency for FunctionGraph to invoke functions"

  project_role {
    project      = var.OTC_SDK_PROJECTNAME
    roles = [
      opentelekomcloud_identity_role_v3.role_fg_invoke.display_name
    ]
  }

}