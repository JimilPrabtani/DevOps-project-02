variable "vpc_name" {
  type = string
}

variable "cidr_block" {
  type = string
}

variable "availability_zones" {
  type = list(string)
}

variable "subnet_cidrs" {
  description = "CIDRs for the PUBLIC subnets (load balancers and NAT only)"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDRs for the PRIVATE subnets where worker nodes run"
  type        = list(string)
}

variable "cluster_name" {
  description = "EKS cluster name for subnet tagging"
  type        = string
}

variable "enable_nat_gateway" {
  description = <<-EOT
    Provision a NAT gateway so nodes in private subnets can reach the internet
    (required to pull images from ECR and reach the EKS control plane).
    Disabling this saves ~$32/month but leaves private nodes unable to pull
    images unless you add VPC endpoints instead.
  EOT
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway for all AZs (cheaper) instead of one per AZ (resilient)"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Record VPC flow logs to CloudWatch for incident investigation"
  type        = bool
  default     = true
}

variable "flow_logs_retention_days" {
  description = "CloudWatch retention for VPC flow logs"
  type        = number
  default     = 30
}
