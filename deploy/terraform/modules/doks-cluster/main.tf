# DigitalOcean Kubernetes (DOKS) Cluster Module

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

resource "digitalocean_kubernetes_cluster" "perceptacle" {
  name    = var.cluster_name
  region  = var.region
  version = var.kubernetes_version

  # Enable auto-upgrade for patch versions
  auto_upgrade = var.auto_upgrade

  # Enable HA control plane for production
  ha = var.ha_control_plane

  # Maintenance window
  maintenance_policy {
    start_time = var.maintenance_window_start
    day        = var.maintenance_window_day
  }

  node_pool {
    name       = "default-pool"
    size       = var.node_size
    node_count = var.node_count
    auto_scale = var.auto_scale

    min_nodes = var.auto_scale ? var.min_nodes : null
    max_nodes = var.auto_scale ? var.max_nodes : null

    labels = {
      environment = var.environment
      managed-by  = "terraform"
    }

    tags = var.node_tags
  }

  tags = concat(
    ["perceptacle", var.environment, "kubernetes"],
    var.cluster_tags
  )
}

# VPC for network isolation (optional, uses default if not specified)
resource "digitalocean_vpc" "perceptacle" {
  count = var.create_vpc ? 1 : 0

  name     = "${var.cluster_name}-vpc"
  region   = var.region
  ip_range = var.vpc_ip_range
}
