variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "vpc_id" {
  description = "VPC the cluster and nodes live in (needed for security groups)"
  type        = string
}

variable "subnet_ids" {
  description = "Subnets for the control plane ENIs (public + private)"
  type        = list(string)
}

variable "node_subnet_ids" {
  description = "PRIVATE subnets where worker nodes are placed"
  type        = list(string)
}

variable "node_group_name" {
  description = "EKS node group name"
  type        = string
}

variable "kubernetes_version" {
  description = "EKS control plane version"
  type        = string
  default     = "1.34"
}

variable "instance_types" {
  description = "List of EC2 instance types for worker nodes"
  type        = list(string)
}

variable "capacity_type" {
  description = "Type of capacity for nodes (ON_DEMAND or SPOT)"
  type        = string
  default     = "ON_DEMAND"
}

variable "desired_size" {
  description = "Desired number of worker nodes"
  type        = number
}

variable "min_size" {
  description = "Minimum number of worker nodes"
  type        = number
}

variable "max_size" {
  description = "Maximum number of worker nodes"
  type        = number
}

variable "disk_size" {
  description = "Root volume size in GiB for worker nodes (encrypted gp3)"
  type        = number
  default     = 20
}

# -----------------------------------------------------------------------------
# Security
# -----------------------------------------------------------------------------
variable "endpoint_public_access" {
  description = <<-EOT
    Expose the Kubernetes API server publicly. Kept true by default so kubectl
    works from a laptop without a VPN, but ALWAYS paired with public_access_cidrs.
    Set to false once you have private connectivity.
  EOT
  type        = bool
  default     = true
}

variable "public_access_cidrs" {
  description = <<-EOT
    CIDR blocks permitted to reach the public API endpoint.

    The default is deliberately NOT 0.0.0.0/0. Set this to your own IP:
      curl -s https://checkip.amazonaws.com

    Leaving it wide open exposes the control plane to the entire internet;
    only IAM stands between an attacker and the cluster.
  EOT
  type        = list(string)

  validation {
    condition     = !contains(var.public_access_cidrs, "0.0.0.0/0")
    error_message = "public_access_cidrs must not contain 0.0.0.0/0. Restrict it to known source IPs."
  }
}

variable "cluster_log_types" {
  description = "Control-plane log types to ship to CloudWatch"
  type        = list(string)
  default     = ["api", "audit", "authenticator", "controllerManager", "scheduler"]
}

variable "log_retention_days" {
  description = "CloudWatch retention for control-plane logs"
  type        = number
  default     = 30
}

variable "enable_secrets_encryption" {
  description = "Envelope-encrypt Kubernetes Secrets in etcd with a customer-managed KMS key"
  type        = bool
  default     = true
}
