# Production Environment - Terraform Configuration

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
  #   key                         = "production/terraform.tfstate"
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

variable "letsencrypt_email" {
  description = "Email for Let's Encrypt notifications"
  type        = string
}

# Locals
locals {
  environment  = "production"
  cluster_name = "perceptacle-production"
}

# Kubernetes Cluster - Production Configuration
module "doks_cluster" {
  source = "../../modules/doks-cluster"

  cluster_name       = local.cluster_name
  region             = var.region
  kubernetes_version = "1.29.1-do.0"

  # Production: larger nodes with auto-scaling
  node_size   = "s-4vcpu-8gb"  # $48/month per node
  node_count  = 3
  auto_scale  = true
  min_nodes   = 3
  max_nodes   = 6

  # HA control plane for production
  ha_control_plane = true

  # Manual upgrades for production (controlled releases)
  auto_upgrade = false

  environment = local.environment

  cluster_tags = ["production", "perceptacle"]
  node_tags    = ["production", "perceptacle-node"]
}

# Configure Kubernetes provider
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

# Managed PostgreSQL - Production
module "database" {
  source = "../../modules/do-database"

  cluster_name = "perceptacle-production-db"
  region       = var.region
  environment  = local.environment

  # Production database configuration
  size       = "db-s-1vcpu-2gb"  # $30/month - can scale up
  node_count = 1  # Set to 2 for HA

  postgresql_version = "15"
  database_name      = "synapse"
  database_user      = "synapse"

  # Enable connection pooling for production
  create_connection_pool = true
  pool_mode              = "transaction"
  pool_size              = 25

  # Allow connections from DOKS cluster
  trusted_sources = [
    {
      type  = "k8s"
      value = module.doks_cluster.cluster_id
    }
  ]
}

# Create namespace for Perceptacle
resource "kubernetes_namespace" "perceptacle" {
  metadata {
    name = "perceptacle-production"

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
    value = "perceptacle-production-lb"
  }

  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/do-loadbalancer-size-unit"
    value = "2"
  }

  # Production: enable proxy protocol for real IPs
  set {
    name  = "controller.service.annotations.service\\.beta\\.kubernetes\\.io/do-loadbalancer-enable-proxy-protocol"
    value = "true"
  }

  set {
    name  = "controller.config.use-proxy-protocol"
    value = "true"
  }

  # Production resource limits
  set {
    name  = "controller.resources.requests.cpu"
    value = "100m"
  }

  set {
    name  = "controller.resources.requests.memory"
    value = "128Mi"
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

# Let's Encrypt ClusterIssuer - Production
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

output "namespace" {
  description = "Kubernetes namespace for Perceptacle"
  value       = kubernetes_namespace.perceptacle.metadata[0].name
}

output "database_host" {
  description = "Database host"
  value       = module.database.host
  sensitive   = true
}

output "database_private_host" {
  description = "Database private host (VPC)"
  value       = module.database.private_host
  sensitive   = true
}

output "database_uri" {
  description = "Database connection URI"
  value       = module.database.connection_uri
  sensitive   = true
}

output "database_pool_uri" {
  description = "Database connection pool URI"
  value       = module.database.connection_pool_uri
  sensitive   = true
}

output "loadbalancer_ip" {
  description = "Load balancer IP (after deployment)"
  value       = "Run: kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}'"
}
