variable "repositories" {
  type = list(string)
}

variable "image_tag_mutability" {
  description = <<-EOT
    IMMUTABLE prevents an existing tag from being overwritten.

    This matters because CI pushes tags derived from the commit SHA and ArgoCD
    deploys whatever that tag currently points at. With MUTABLE tags, anyone
    with ECR push access could replace the image behind an already-reviewed
    SHA and the cluster would pull it on the next restart — with no Git commit
    to show for it.
  EOT
  type        = string
  default     = "IMMUTABLE"
}

variable "force_delete" {
  description = <<-EOT
    Allow `terraform destroy` to delete repositories that still contain images.
    Convenient for a teardown-friendly demo; set to false for anything you
    would be upset to lose.
  EOT
  type        = bool
  default     = true
}

variable "untagged_expiry_days" {
  description = "Delete untagged images after this many days"
  type        = number
  default     = 7
}

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repositories)

  name                 = each.value
  force_delete         = var.force_delete
  image_tag_mutability = var.image_tag_mutability

  image_scanning_configuration {
    scan_on_push = true
  }

  # Images are encrypted at rest by default with AES256; stated explicitly so
  # the intent survives future edits.
  encryption_configuration {
    encryption_type = "AES256"
  }
}

# Keep the registry from growing without bound — untagged layers accumulate on
# every rebuild and are billed monthly.
resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each = aws_ecr_repository.repos

  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Expire untagged images"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = var.untagged_expiry_days
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Keep only the 30 most recent images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 30
        }
        action = { type = "expire" }
      },
    ]
  })
}

# Deny pulls over unencrypted transport.
resource "aws_ecr_repository_policy" "require_tls" {
  for_each = aws_ecr_repository.repos

  repository = each.value.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "DenyInsecureTransport"
        Effect    = "Deny"
        Principal = "*"
        Action    = "ecr:*"
        Condition = {
          Bool = { "aws:SecureTransport" = "false" }
        }
      }
    ]
  })
}
