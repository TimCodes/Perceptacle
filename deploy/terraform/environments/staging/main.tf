# Staging Environment - Terraform Configuration

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.0"
    }
  }

  # Configure remote state storage in DigitalOcean Spaces
  # Uncomment and configure when ready:
  # backend "s3" {
  #   endpoint                    = "nyc3.digitaloceanspaces.com"
  #   region                      = "us-east-1"  # Required but ignored
  #   bucket                      = "perceptacle-terraform-state"
  #   key                         = "staging/terraform.tfstate"
  #   skip_credentials_validation = true
  #   skip_metadata_api_check     = true
  # }
}

# DigitalOcean Provider
provider "digitalocean" {
  token = var.do_token
}

# Variables
variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
}

# Locals
locals {
  environment  = "staging"
  cluster_name = "perceptacle-staging"
}

# Container Registry (shared across environments)
module "registry" {
  source = "../../modules/do-registry"

  registry_name     = "perceptacle"
  subscription_tier = "basic"  # $5/month, 5GB storage
  region            = var.region
}

# Kubernetes Cluster
module "doks_cluster" {
  source = "../../modules/doks-cluster"

  cluster_name       = local.cluster_name
  region             = var.region
  kubernetes_version = "1.29.1-do.0"

  # Staging: smaller nodes, no auto-scaling
  node_size   = "s-2vcpu-4gb"  # $24/month per node
  node_count  = 3
  auto_scale  = false

  # No HA control plane for staging
  ha_control_plane = false

  # Auto-upgrade enabled for staging
  auto_upgrade = true

  environment = local.environment

  cluster_tags = ["staging", "perceptacle"]
  node_tags    = ["staging", "perceptacle-node"]
}

# Configure Kubernetes provider with cluster credentials
provider "kubernetes" {
  host                   = module.doks_cluster.cluster_endpoint
  token                  = module.doks_cluster.cluster_token
  cluster_ca_certificate = base64decode(module.doks_cluster.cluster_ca_certificate)
}

# Configure Helm provider
provider "helm" {
  kubernetes {
    host                   = module.doks_cluster.cluster_endpoint
    token                  = module.doks_cluster.cluster_token
    cluster_ca_certificate = base64decode(module.doks_cluster.cluster_ca_certificate)
  }
}

# Managed PostgreSQL (optional - can use in-cluster PostgreSQL instead)
# Uncomment to use managed database:
# module "database" {
#   source = "../../modules/do-database"
#
#   cluster_name = "perceptacle-staging-db"
#   region       = var.region
#   environment  = local.environment
#
#   # Smallest managed DB tier
#   size       = "db-s-1vcpu-1gb"  # $15/month
#   node_count = 1
#
#   # Allow connections from DOKS cluster
#   trusted_sources = [
#     {
#       type  = "k8s"
#       value = module.doks_cluster.cluster_id
#     }
#   ]
# }

# Create namespace for Perceptacle
resource "kubernetes_namespace" "perceptacle" {
  metadata {
    name = "perceptacle-staging"

    labels = {
      environment = local.environment
      managed-by  = "terraform"
    }
  }

  depends_on = [module.doks_cluster]
}

# Install nginx-ingress controller
resource "helm_release" "nginx_ingress" {
  name             = "nginx-ingress"
  repository       = "https://kubernetes.github.io/ingress-nginx"
  chart            = "ingress-nginx"
  namespace        = "ingress-nginx"
  create_namespace = true
  version          = "4.9.0"

  set {
    name  = "controller.service.type"
    value = "LoadBalancer"
  }

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/do-loadbalancer-name"
    value = "perceptacle-staging-lb"
  }

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/do-loadbalancer-size-unit"
    value = "1"
  }

  depends_on = [module.doks_cluster]
}

# Install cert-manager for TLS
resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  namespace        = "cert-manager"
  create_namespace = true
  version          = "v1.14.0"

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [module.doks_cluster]
}

# Let's Encrypt ClusterIssuer
resource "kubernetes_manifest" "letsencrypt_issuer" {
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "ClusterIssuer"
    metadata = {
      name = "letsencrypt-prod"
    }
    spec = {
      acme = {
        server = "https://acme-v02.api.letsencrypt.org/directory"
        email  = var.letsencrypt_email
        privateKeySecretRef = {
          name = "letsencrypt-prod-account-key"
        }
        solvers = [
          {
            http01 = {
              ingress = {
                class = "nginx"
              }
            }
          }
        ]
      }
    }
  }

  depends_on = [helm_release.cert_manager]
}

variable "letsencrypt_email" {
  description = "Email for Let's Encrypt notifications"
  type        = string
  default     = "admin@perceptacle.example.com"
}

# Outputs
output "cluster_name" {
  description = "Name of the Kubernetes cluster"
  value       = module.doks_cluster.cluster_name
}

output "cluster_endpoint" {
  description = "Kubernetes API endpoint"
  value       = module.doks_cluster.cluster_endpoint
  sensitive   = true
}

output "kubeconfig" {
  description = "Kubeconfig for the cluster"
  value       = module.doks_cluster.kubeconfig
  sensitive   = true
}

output "registry_endpoint" {
  description = "Container registry endpoint"
  value       = module.registry.registry_endpoint
}

output "namespace" {
  description = "Kubernetes namespace for Perceptacle"
  value       = kubernetes_namespace.perceptacle.metadata[0].name
}

# Uncomment if using managed database:
# output "database_host" {
#   description = "Database host"
#   value       = module.database.host
#   sensitive   = true
# }
#
# output "database_uri" {
#   description = "Database connection URI"
#   value       = module.database.connection_uri
#   sensitive   = true
# }
