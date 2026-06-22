# prefix will be prepended to all resource names
variable "prefix" {
  type    = string
  default = "set in variables.tfvars"
}

variable "appname" {
  type    = string
  default = "set in variables.tfvars"
}

# Resource tag:
variable "tag_app_group" {
  type    = string
  default = "set in variables.tfvars"
}

variable "API_GATEWAY_INSTANCE_ID" {
  type    = string
  default = "your_api_gateway_instance_id"
}
