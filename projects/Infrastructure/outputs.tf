output "cluster_name" {
  value = module.eks.cluster_name
}

output "cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "ecr_urls" {
  value = module.ecr.repository_urls
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnets — load balancers and NAT only"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnets — worker nodes have no public IPs"
  value       = module.vpc.private_subnet_ids
}

output "node_security_group_id" {
  value = module.eks.node_security_group_id
}

output "oidc_provider_arn" {
  description = "Use this to grant IRSA roles to service accounts"
  value       = module.eks.oidc_provider_arn
}

output "secrets_kms_key_arn" {
  description = "KMS key encrypting Kubernetes Secrets at rest"
  value       = module.eks.secrets_kms_key_arn
}

output "api_endpoint_access" {
  description = "Reminder of who can reach the Kubernetes API"
  value = {
    public_enabled = var.endpoint_public_access
    allowed_cidrs  = var.public_access_cidrs
  }
}
