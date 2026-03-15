# DigitalOcean Managed PostgreSQL Module

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

resource "digitalocean_database_cluster" "postgresql" {
  name       = var.cluster_name
  engine     = "pg"
  version    = var.postgresql_version
  size       = var.size
  region     = var.region
  node_count = var.node_count

  # Maintenance window
  maintenance_window {
    day  = var.maintenance_window_day
    hour = var.maintenance_window_hour
  }

  tags = concat(
    ["perceptacle", var.environment, "postgresql"],
    var.tags
  )
}

# Create database
resource "digitalocean_database_db" "synapse" {
  cluster_id = digitalocean_database_cluster.postgresql.id
  name       = var.database_name
}

# Create database user
resource "digitalocean_database_user" "synapse" {
  cluster_id = digitalocean_database_cluster.postgresql.id
  name       = var.database_user
}

# Firewall rules for the database cluster
resource "digitalocean_database_firewall" "perceptacle" {
  cluster_id = digitalocean_database_cluster.postgresql.id

  dynamic "rule" {
    for_each = var.trusted_sources
    content {
      type  = rule.value.type
      value = rule.value.value
    }
  }
}

# Connection pool for better performance
resource "digitalocean_database_connection_pool" "synapse" {
  count = var.create_connection_pool ? 1 : 0

  cluster_id = digitalocean_database_cluster.postgresql.id
  name       = "${var.database_name}-pool"
  mode       = var.pool_mode
  size       = var.pool_size
  db_name    = digitalocean_database_db.synapse.name
  user       = digitalocean_database_user.synapse.name
}

# Variables
variable "cluster_name" {
  description = "Name of the database cluster"
  type        = string
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
}

variable "postgresql_version" {
  description = "PostgreSQL major version"
  type        = string
  default     = "15"
}

variable "size" {
  description = "Database droplet size"
  type        = string
  default     = "db-s-1vcpu-1gb"  # $15/month
}

variable "node_count" {
  description = "Number of nodes (1 for basic, 2+ for HA)"
  type        = number
  default     = 1
}

variable "database_name" {
  description = "Name of the database to create"
  type        = string
  default     = "synapse"
}

variable "database_user" {
  description = "Database user to create"
  type        = string
  default     = "synapse"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "staging"
}

variable "maintenance_window_day" {
  description = "Day for maintenance window"
  type        = string
  default     = "sunday"
}

variable "maintenance_window_hour" {
  description = "Hour for maintenance window (UTC)"
  type        = string
  default     = "04:00"
}

variable "tags" {
  description = "Additional tags"
  type        = list(string)
  default     = []
}

variable "trusted_sources" {
  description = "Trusted sources for database firewall"
  type = list(object({
    type  = string
    value = string
  }))
  default = []
}

variable "create_connection_pool" {
  description = "Create a connection pool"
  type        = bool
  default     = false
}

variable "pool_mode" {
  description = "Connection pool mode (transaction, session, statement)"
  type        = string
  default     = "transaction"
}

variable "pool_size" {
  description = "Connection pool size"
  type        = number
  default     = 10
}
