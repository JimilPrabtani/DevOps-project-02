output "vpc_id" {
  value = aws_vpc.vpc.id
}

output "vpc_cidr_block" {
  value = aws_vpc.vpc.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnets — internet-facing load balancers only"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnets — where worker nodes run"
  value       = aws_subnet.private[*].id
}

# Control plane ENIs are placed across both tiers so the API server can reach
# nodes and so public-facing load balancers can be provisioned.
output "all_subnet_ids" {
  value = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
}
