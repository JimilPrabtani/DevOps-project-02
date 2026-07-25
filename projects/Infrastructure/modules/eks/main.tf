# =============================================================================
# EKS cluster
#
# KEY SECURITY CHANGES:
#   - API endpoint no longer open to 0.0.0.0/0; private access enabled.
#   - Control-plane audit logging turned on (there was none).
#   - Kubernetes Secrets encrypted at rest with a customer-managed KMS key.
#   - Worker nodes moved to private subnets with a dedicated security group.
#   - Node root volumes encrypted via a launch template.
# =============================================================================

data "aws_caller_identity" "current" {}

# -----------------------------------------------------------------------------
# KMS key for envelope-encrypting Kubernetes Secrets
#
# Without this, Secret values sit base64-encoded (NOT encrypted) in etcd.
# -----------------------------------------------------------------------------
resource "aws_kms_key" "eks" {
  count = var.enable_secrets_encryption ? 1 : 0

  description             = "EKS secrets envelope encryption for ${var.cluster_name}"
  enable_key_rotation     = true
  deletion_window_in_days = 10

  tags = {
    Name = "${var.cluster_name}-secrets-key"
  }
}

resource "aws_kms_alias" "eks" {
  count = var.enable_secrets_encryption ? 1 : 0

  name          = "alias/${var.cluster_name}-secrets"
  target_key_id = aws_kms_key.eks[0].key_id
}

# -----------------------------------------------------------------------------
# Cluster IAM role
# -----------------------------------------------------------------------------
resource "aws_iam_role" "eks_cluster_role" {
  name = "${var.cluster_name}-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "eks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "cluster_policy" {
  role       = aws_iam_role.eks_cluster_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
}

# -----------------------------------------------------------------------------
# Cluster
# -----------------------------------------------------------------------------
resource "aws_eks_cluster" "eks" {
  name     = var.cluster_name
  role_arn = aws_iam_role.eks_cluster_role.arn
  version  = var.kubernetes_version

  access_config {
    authentication_mode                         = "API_AND_CONFIG_MAP"
    bootstrap_cluster_creator_admin_permissions = true
  }

  vpc_config {
    subnet_ids = var.subnet_ids

    # Private access means nodes and in-VPC tooling reach the API server over
    # the AWS network rather than the public internet.
    endpoint_private_access = true

    # Public access remains available for kubectl from a workstation, but is
    # now restricted to an explicit CIDR allowlist instead of the entire
    # internet. Set endpoint_public_access = false once you have a bastion or
    # VPN in place.
    endpoint_public_access = var.endpoint_public_access
    public_access_cidrs    = var.public_access_cidrs

    security_group_ids = [aws_security_group.cluster.id]
  }

  # Audit logs are the primary forensic record of who did what to the cluster.
  # Previously none of these were enabled.
  enabled_cluster_log_types = var.cluster_log_types

  dynamic "encryption_config" {
    for_each = var.enable_secrets_encryption ? [1] : []
    content {
      provider {
        key_arn = aws_kms_key.eks[0].arn
      }
      resources = ["secrets"]
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.cluster_policy,
    aws_cloudwatch_log_group.cluster,
  ]
}

# Create the log group ahead of the cluster so retention is bounded; EKS
# otherwise creates it with "never expire".
resource "aws_cloudwatch_log_group" "cluster" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = var.log_retention_days
}

# -----------------------------------------------------------------------------
# Security groups
# -----------------------------------------------------------------------------
resource "aws_security_group" "cluster" {
  name        = "${var.cluster_name}-cluster-sg"
  description = "EKS control plane security group"
  vpc_id      = var.vpc_id

  tags = {
    Name = "${var.cluster_name}-cluster-sg"
  }
}

resource "aws_security_group" "nodes" {
  name        = "${var.cluster_name}-node-sg"
  description = "EKS worker node security group"
  vpc_id      = var.vpc_id

  tags = {
    Name                                        = "${var.cluster_name}-node-sg"
    "kubernetes.io/cluster/${var.cluster_name}" = "owned"
  }
}

# Nodes talk to each other (kubelet, CNI, service traffic).
resource "aws_security_group_rule" "nodes_internal" {
  type                     = "ingress"
  security_group_id        = aws_security_group.nodes.id
  source_security_group_id = aws_security_group.nodes.id
  protocol                 = "-1"
  from_port                = 0
  to_port                  = 0
  description              = "Node-to-node communication"
}

# Control plane -> kubelet (logs, exec, port-forward, metrics).
resource "aws_security_group_rule" "nodes_from_cluster" {
  type                     = "ingress"
  security_group_id        = aws_security_group.nodes.id
  source_security_group_id = aws_security_group.cluster.id
  protocol                 = "tcp"
  from_port                = 1025
  to_port                  = 65535
  description              = "Control plane to kubelet and pods"
}

resource "aws_security_group_rule" "nodes_from_cluster_https" {
  type                     = "ingress"
  security_group_id        = aws_security_group.nodes.id
  source_security_group_id = aws_security_group.cluster.id
  protocol                 = "tcp"
  from_port                = 443
  to_port                  = 443
  description              = "Control plane to webhooks/extension API servers"
}

# Nodes need outbound access for ECR pulls and AWS APIs (via NAT).
resource "aws_security_group_rule" "nodes_egress" {
  type              = "egress"
  security_group_id = aws_security_group.nodes.id
  protocol          = "-1"
  from_port         = 0
  to_port           = 0
  cidr_blocks       = ["0.0.0.0/0"]
  description       = "Outbound to AWS APIs and image registries"
}

# Control plane -> nodes.
resource "aws_security_group_rule" "cluster_to_nodes" {
  type                     = "egress"
  security_group_id        = aws_security_group.cluster.id
  source_security_group_id = aws_security_group.nodes.id
  protocol                 = "tcp"
  from_port                = 1025
  to_port                  = 65535
  description              = "Control plane to node ports"
}

resource "aws_security_group_rule" "cluster_to_nodes_https" {
  type                     = "egress"
  security_group_id        = aws_security_group.cluster.id
  source_security_group_id = aws_security_group.nodes.id
  protocol                 = "tcp"
  from_port                = 443
  to_port                  = 443
  description              = "Control plane to node HTTPS"
}

resource "aws_security_group_rule" "cluster_from_nodes" {
  type                     = "ingress"
  security_group_id        = aws_security_group.cluster.id
  source_security_group_id = aws_security_group.nodes.id
  protocol                 = "tcp"
  from_port                = 443
  to_port                  = 443
  description              = "Nodes to API server"
}

# -----------------------------------------------------------------------------
# OIDC provider for IRSA
# -----------------------------------------------------------------------------
data "tls_certificate" "eks" {
  url = aws_eks_cluster.eks.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.eks.identity[0].oidc[0].issuer
}

# -----------------------------------------------------------------------------
# Node group role
# -----------------------------------------------------------------------------
resource "aws_iam_role" "eks_node_role" {
  name = "${var.cluster_name}-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "worker_node_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
}

resource "aws_iam_role_policy_attachment" "cni_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

resource "aws_iam_role_policy_attachment" "ecr_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# Lets Systems Manager Session Manager replace SSH for node access — no
# inbound port 22 rule and no key pairs to leak.
resource "aws_iam_role_policy_attachment" "ssm_policy" {
  role       = aws_iam_role.eks_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# -----------------------------------------------------------------------------
# Launch template — encrypted root volume and IMDSv2 enforcement
# -----------------------------------------------------------------------------
resource "aws_launch_template" "nodes" {
  name_prefix = "${var.cluster_name}-node-"

  vpc_security_group_ids = [aws_security_group.nodes.id]

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size           = var.disk_size
      volume_type           = "gp3"
      encrypted             = true
      delete_on_termination = true
    }
  }

  # IMDSv2 required. With IMDSv1 available, any SSRF in a pod can read the
  # node's IAM role credentials from 169.254.169.254 with a single GET.
  # hop_limit = 1 stops containers from reaching IMDS through the pod network.
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "disabled"
  }

  monitoring {
    enabled = true
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "${var.cluster_name}-node"
    }
  }

  lifecycle {
    create_before_destroy = true
  }
}

# -----------------------------------------------------------------------------
# Node group — now in PRIVATE subnets
# -----------------------------------------------------------------------------
resource "aws_eks_node_group" "node_group" {
  cluster_name    = aws_eks_cluster.eks.name
  node_group_name = var.node_group_name
  node_role_arn   = aws_iam_role.eks_node_role.arn

  # var.node_subnet_ids is the private tier. Nodes previously ran in public
  # subnets with auto-assigned public IPs.
  subnet_ids = var.node_subnet_ids

  instance_types = var.instance_types
  capacity_type  = var.capacity_type

  launch_template {
    id      = aws_launch_template.nodes.id
    version = aws_launch_template.nodes.latest_version
  }

  scaling_config {
    desired_size = var.desired_size
    min_size     = var.min_size
    max_size     = var.max_size
  }

  update_config {
    max_unavailable = 1
  }

  tags = {
    Terraform = "true"
  }

  depends_on = [
    aws_iam_role_policy_attachment.worker_node_policy,
    aws_iam_role_policy_attachment.cni_policy,
    aws_iam_role_policy_attachment.ecr_policy,
  ]

  lifecycle {
    ignore_changes = [scaling_config[0].desired_size]
  }
}

# -----------------------------------------------------------------------------
# EBS CSI driver via IRSA
# -----------------------------------------------------------------------------
data "aws_iam_policy_document" "ebs_csi_assume_role" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.eks.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "${replace(aws_eks_cluster.eks.identity[0].oidc[0].issuer, "https://", "")}:sub"
      values   = ["system:serviceaccount:kube-system:ebs-csi-controller-sa"]
    }

    # Pin the audience as well as the subject — without this the role can be
    # assumed by any OIDC token from the cluster, not just the CSI driver's.
    condition {
      test     = "StringEquals"
      variable = "${replace(aws_eks_cluster.eks.identity[0].oidc[0].issuer, "https://", "")}:aud"
      values   = ["sts.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "ebs_csi_irsa" {
  name               = "${var.cluster_name}-ebs-csi-irsa"
  assume_role_policy = data.aws_iam_policy_document.ebs_csi_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ebs_csi_irsa_policy" {
  role       = aws_iam_role.ebs_csi_irsa.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy"
}

resource "aws_eks_addon" "ebs_csi" {
  cluster_name             = aws_eks_cluster.eks.name
  addon_name               = "aws-ebs-csi-driver"
  service_account_role_arn = aws_iam_role.ebs_csi_irsa.arn

  depends_on = [
    aws_iam_role_policy_attachment.ebs_csi_irsa_policy,
    aws_eks_node_group.node_group,
  ]
}

# -----------------------------------------------------------------------------
# VPC CNI addon with NetworkPolicy enforcement
#
# REQUIRED for gitops/network-policies.yml to have any effect. Without it the
# policies are stored but never enforced.
# -----------------------------------------------------------------------------
resource "aws_eks_addon" "vpc_cni" {
  cluster_name = aws_eks_cluster.eks.name
  addon_name   = "vpc-cni"

  configuration_values = jsonencode({
    enableNetworkPolicy = "true"
  })

  depends_on = [aws_eks_node_group.node_group]
}
