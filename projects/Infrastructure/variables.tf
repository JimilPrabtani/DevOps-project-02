variable "region" {
  description = "The name of the region"
  type        = string
}

variable "vpc_name" {
  description = "VPC name"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR Value"
  type        = string
}

variable "subnets" {
  description = "PUBLIC subnets — internet-facing load balancers and the NAT gateway"
  type = list(object({
    name              = string
    cidr_block        = string
    availability_zone = string
  }))
}

variable "private_subnets" {
  description = "PRIVATE subnets — where worker nodes run (no public IPs)"
  type = list(object({
    name              = string
    cidr_block        = string
    availability_zone = string
  }))
}

variable "cluster_name" {
  description = "The name of the Kubernetes Cluster"
  type        = string
}

variable "node_group_name" {
  type        = string
  description = "EKS node group name"
}

variable "instance_types" {
  type        = list(string)
  description = "Instance types for worker nodes"
}

variable "capacity_type" {
  type        = string
  description = "ON_DEMAND or SPOT"
  default     = "ON_DEMAND"
}

variable "desired_size" {
  type        = number
  description = "Desired number of worker nodes"
}

variable "min_size" {
  type        = number
  description = "Minimum number of worker nodes"
}

variable "max_size" {
  type        = number
  description = "Maximum number of worker nodes"
}

variable "disk_size" {
  type = number
}

variable "repositories" {
  type = list(string)
}

# -----------------------------------------------------------------------------
# Security
# -----------------------------------------------------------------------------
variable "public_access_cidrs" {
  description = <<-EOT
    CIDRs allowed to reach the EKS public API endpoint.

    REQUIRED — there is no default on purpose. Find your IP with:
      curl -s https://checkip.amazonaws.com
    then set: public_access_cidrs = ["203.0.113.42/32"]

    The module rejects 0.0.0.0/0.
  EOT
  type        = list(string)
}

variable "endpoint_public_access" {
  description = "Expose the Kubernetes API publicly (restricted by public_access_cidrs)"
  type        = bool
  default     = true
}

variable "enable_secrets_encryption" {
  description = "Envelope-encrypt Kubernetes Secrets in etcd with a customer-managed KMS key"
  type        = bool
  default     = true
}

variable "enable_nat_gateway" {
  description = "NAT gateway for private subnets (~$32/month). Required for private nodes to pull images."
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "One NAT for all AZs (cheaper) vs one per AZ (resilient)"
  type        = bool
  default     = true
}

variable "enable_flow_logs" {
  description = "Record VPC flow logs to CloudWatch"
  type        = bool
  default     = true
}

variable "argocd_server_insecure" {
  description = <<-EOT
    Run the ArgoCD API server without TLS.

    Previously hardcoded to true, which meant ArgoCD credentials and session
    tokens crossed the cluster network in cleartext. Keep this false and use
    `kubectl port-forward` (which is itself encrypted) to reach the UI.
  EOT
  type        = bool
  default     = false
}
