variable "argocd_server_insecure" {
  description = <<-EOT
    Run the ArgoCD API server with TLS disabled.

    This was previously hardcoded to `true`, meaning the admin password and
    every session token travelled the cluster network in cleartext, readable
    by any pod able to sniff traffic. Defaults to false now; reach the UI via
    `kubectl port-forward`, which provides its own encrypted tunnel.
  EOT
  type        = bool
  default     = false
}

resource "kubernetes_namespace_v1" "argocd" {
  metadata {
    name = "argocd"
    # Lets NetworkPolicies in other namespaces select this one by name.
    labels = {
      "kubernetes.io/metadata.name" = "argocd"
    }
  }
}

resource "kubernetes_namespace_v1" "monitoring" {
  metadata {
    name = "monitoring"
    labels = {
      "kubernetes.io/metadata.name" = "monitoring"
    }
  }
}

terraform {
  required_providers {
    kubernetes = {
      source = "hashicorp/kubernetes"
    }
    helm = {
      source = "hashicorp/helm"
    }
  }
}

resource "helm_release" "argocd" {
  name       = "argocd"
  namespace  = kubernetes_namespace_v1.argocd.metadata[0].name
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  version    = "7.7.11"

  create_namespace = false

  values = [
    yamlencode({
      server = {
        service = {
          type = "ClusterIP"
        }
        # Resource limits so a busy ArgoCD cannot starve the single node.
        resources = {
          requests = { cpu = "100m", memory = "128Mi" }
          limits   = { cpu = "500m", memory = "512Mi" }
        }
      }

      configs = {
        params = {
          "server.insecure" = var.argocd_server_insecure
        }
        cm = {
          # Shorter session lifetime limits the value of a stolen token.
          "users.session.duration" = "8h"
        }
      }

      # The repo-server and controller both benefit from bounded resources.
      repoServer = {
        resources = {
          requests = { cpu = "100m", memory = "128Mi" }
          limits   = { cpu = "500m", memory = "512Mi" }
        }
      }

      controller = {
        resources = {
          requests = { cpu = "250m", memory = "256Mi" }
          limits   = { cpu = "1", memory = "1Gi" }
        }
      }
    })
  ]
}

resource "helm_release" "monitoring" {
  name      = "kube-prometheus-stack"
  namespace = kubernetes_namespace_v1.monitoring.metadata[0].name

  repository = "https://prometheus-community.github.io/helm-charts"
  chart      = "kube-prometheus-stack"
  version    = "65.1.1"

  timeout          = 900
  create_namespace = false

  values = [
    yamlencode({
      grafana = {
        service = {
          type = "ClusterIP"
        }
        # Never expose Grafana publicly without authentication in front of it.
        "grafana.ini" = {
          users = {
            allow_sign_up = false
          }
          auth = {
            disable_login_form = false
          }
        }
      }

      prometheus = {
        service = {
          type = "ClusterIP"
        }
      }

      alertmanager = {
        service = {
          type = "ClusterIP"
        }
      }
    })
  ]

  depends_on = [
    kubernetes_namespace_v1.monitoring
  ]
}
