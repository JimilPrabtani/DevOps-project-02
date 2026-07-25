output "cluster_name" {
  value = aws_eks_cluster.eks.name
}

output "cluster_endpoint" {
  value = aws_eks_cluster.eks.endpoint
}

output "cluster_certificate_authority_data" {
  value = aws_eks_cluster.eks.certificate_authority[0].data
}

output "cluster_security_group_id" {
  value = aws_security_group.cluster.id
}

output "node_security_group_id" {
  value = aws_security_group.nodes.id
}

output "oidc_provider_arn" {
  value = aws_iam_openid_connect_provider.eks.arn
}

output "oidc_provider_url" {
  value = aws_eks_cluster.eks.identity[0].oidc[0].issuer
}

output "node_group_name" {
  value = aws_eks_node_group.node_group.node_group_name
}

output "node_group_arn" {
  value = aws_eks_node_group.node_group.arn
}

output "node_group_status" {
  value = aws_eks_node_group.node_group.status
}

output "secrets_kms_key_arn" {
  value       = var.enable_secrets_encryption ? aws_kms_key.eks[0].arn : null
  description = "KMS key encrypting Kubernetes Secrets at rest"
}
