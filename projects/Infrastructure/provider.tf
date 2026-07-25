terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.30"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 3.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }

  # ---------------------------------------------------------------------------
  # REMOTE STATE — strongly recommended before any shared or long-lived use.
  #
  # State is currently LOCAL. That means:
  #   - terraform.tfstate sits unencrypted on the workstation and contains
  #     every generated value, including the EKS cluster CA and any secret
  #     passed through a resource attribute.
  #   - There is no locking, so two concurrent applies can corrupt state.
  #   - Losing the file means losing the ability to manage or destroy the
  #     infrastructure it tracks.
  #
  # Bootstrap the backend once (S3 has supported native locking since
  # provider v5.x, so a DynamoDB table is no longer required):
  #
  #   aws s3api create-bucket --bucket <your-tf-state-bucket> --region us-east-1
  #   aws s3api put-bucket-versioning --bucket <your-tf-state-bucket> \
  #     --versioning-configuration Status=Enabled
  #   aws s3api put-bucket-encryption --bucket <your-tf-state-bucket> \
  #     --server-side-encryption-configuration \
  #     '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
  #   aws s3api put-public-access-block --bucket <your-tf-state-bucket> \
  #     --public-access-block-configuration \
  #     BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
  #
  # Then uncomment the block below and run `terraform init -migrate-state`.
  # ---------------------------------------------------------------------------
  # backend "s3" {
  #   bucket       = "<your-tf-state-bucket>"
  #   key          = "devops-ai-playbook/infrastructure.tfstate"
  #   region       = "us-east-1"
  #   encrypt      = true
  #   use_lockfile = true
  # }
}

provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project     = "devops-ai-playbook"
      ManagedBy   = "terraform"
      Environment = "demo"
    }
  }
}
