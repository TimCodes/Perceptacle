# Variables for DOKS Cluster Module

variable "cluster_name" {
  description = "Name of the Kubernetes cluster"
  type        = string
}

variable "region" {
  description = "DigitalOcean region for the cluster"
  type        = string
  default     = "nyc1"
}

variable "kubernetes_version" {
  description = "Kubernetes version to use"
  type        = string
  default     = "1.29.1-do.0"
}

variable "node_size" {
  description = "Droplet size for cluster nodes"
  type        = string
  default     = "s-2vcpu-4gb"
}

variable "node_count" {
  description = "Number of nodes in the default pool"
  type        = number
  default     = 3
}

variable "auto_scale" {
  description = "Enable auto-scaling for the node pool"
  type        = bool
  default     = false
}

variable "min_nodes" {
  description = "Minimum number of nodes when auto-scaling is enabled"
  type        = number
  default     = 2
}

variable "max_nodes" {
  description = "Maximum number of nodes when auto-scaling is enabled"
  type        = number
  default     = 5
}

variable "auto_upgrade" {
  description = "Enable automatic upgrades for Kubernetes"
  type        = bool
  default     = true
}

variable "ha_control_plane" {
  description = "Enable HA control plane (recommended for production)"
  type        = bool
  default     = false
}

variable "maintenance_window_start" {
  description = "Start time for maintenance window (24-hour format)"
  type        = string
  default     = "04:00"
}

variable "maintenance_window_day" {
  description = "Day of the week for maintenance window"
  type        = string
  default     = "sunday"
}

variable "environment" {
  description = "Environment name (staging, production)"
  type        = string
  default     = "staging"
}

variable "node_tags" {
  description = "Tags to apply to cluster nodes"
  type        = list(string)
  default     = []
}

variable "cluster_tags" {
  description = "Tags to apply to the cluster"
  type        = list(string)
  default     = []
}

variable "create_vpc" {
  description = "Create a new VPC for the cluster"
  type        = bool
  default     = false
}

variable "vpc_ip_range" {
  description = "IP range for the VPC"
  type        = string
  default     = "10.10.0.0/16"
}
