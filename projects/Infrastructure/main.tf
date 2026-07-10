data "aws_caller_identity" "current" {}

locals {
  terraform_principal_arn = can(regex("^arn:aws:sts::[0-9]+:assumed-role/[^/]+/.+$", data.aws_caller_identity.current.arn)) ? regexreplace(data.aws_caller_identity.current.arn, "^arn:aws:sts::([0-9]+):assumed-role/([^/]+)/.+$", "arn:aws:iam::$1:role/$2") : data.aws_caller_identity.current.arn
}

module "vpc" {
  source = "./modules/vpc"

  vpc_name     = var.vpc_name
  cidr_block   = var.vpc_cidr
  subnet_cidrs = [for s in var.subnets : s.cidr_block]
  availability_zones = [for s in var.subnets : s.availability_zone]
  cluster_name     = var.cluster_name
}


module "eks" {
  source = "./modules/eks"

  cluster_name     = var.cluster_name
  node_group_name  = var.node_group_name

  instance_types = var.instance_types
  min_size       = var.min_size
  desired_size   = var.desired_size
  max_size       = var.max_size

  subnet_ids = module.vpc.subnet_ids
  depends_on = [module.vpc]
}

module "ecr" {
  source = "./modules/ecr"

  repositories = var.repositories
}

resource "aws_eks_access_entry" "terraform_admin" {
  cluster_name  = module.eks.cluster_name
  principal_arn = local.terraform_principal_arn
  type          = "STANDARD"
}

resource "aws_eks_access_policy_association" "terraform_admin" {
  cluster_name  = module.eks.cluster_name
  principal_arn = local.terraform_principal_arn
  policy_arn    = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSClusterAdminPolicy"

  access_scope {
    type = "cluster"
  }

  depends_on = [aws_eks_access_entry.terraform_admin]
}


data "aws_eks_cluster_auth" "eks" {
  name = module.eks.cluster_name
}

provider "kubernetes" {
  alias                  = "eks"
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
  token                  = data.aws_eks_cluster_auth.eks.token
}

provider "helm" {
  alias = "eks"

  kubernetes =  {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)
    token                  = data.aws_eks_cluster_auth.eks.token
  }
}


module "argocd" {
  source = "./modules/argocd"

  providers = {
    kubernetes = kubernetes.eks
    helm       = helm.eks
  }

  depends_on = [module.eks, aws_eks_access_policy_association.terraform_admin]
}

