# DigitalOcean Container Registry Module

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

resource "digitalocean_container_registry" "perceptacle" {
  name                   = var.registry_name
  subscription_tier_slug = var.subscription_tier
  region                 = var.region
}

# Docker credentials for the registry
resource "digitalocean_container_registry_docker_credentials" "perceptacle" {
  registry_name = digitalocean_container_registry.perceptacle.name
  write         = true
  expiry_seconds = var.credentials_expiry_seconds
}

# Variables
variable "registry_name" {
  description = "Name of the container registry"
  type        = string
  default     = "perceptacle"
}

variable "subscription_tier" {
  description = "Subscription tier (starter, basic, professional)"
  type        = string
  default     = "basic"
}

variable "region" {
  description = "Region for the container registry"
  type        = string
  default     = "nyc3"
}

variable "credentials_expiry_seconds" {
  description = "Expiry time for Docker credentials (0 = never)"
  type        = number
  default     = 0
}

# Outputs
output "registry_endpoint" {
  description = "Endpoint of the container registry"
  value       = digitalocean_container_registry.perceptacle.endpoint
}

output "registry_name" {
  description = "Name of the container registry"
  value       = digitalocean_container_registry.perceptacle.name
}

output "docker_credentials" {
  description = "Docker credentials for the registry"
  value       = digitalocean_container_registry_docker_credentials.perceptacle.docker_credentials
  sensitive   = true
}

output "registry_server" {
  description = "Registry server address"
  value       = digitalocean_container_registry.perceptacle.server_url
}
