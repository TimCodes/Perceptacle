# Outputs for DOKS Cluster Module

output "cluster_id" {
  description = "ID of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.id
}

output "cluster_name" {
  description = "Name of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.name
}

output "cluster_endpoint" {
  description = "Endpoint for the Kubernetes API server"
  value       = digitalocean_kubernetes_cluster.perceptacle.endpoint
  sensitive   = true
}

output "cluster_token" {
  description = "Token for authenticating with the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.kube_config[0].token
  sensitive   = true
}

output "cluster_ca_certificate" {
  description = "CA certificate for the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.kube_config[0].cluster_ca_certificate
  sensitive   = true
}

output "kubeconfig" {
  description = "Raw kubeconfig for the cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.kube_config[0].raw_config
  sensitive   = true
}

output "cluster_urn" {
  description = "URN of the Kubernetes cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.urn
}

output "cluster_region" {
  description = "Region where the cluster is deployed"
  value       = digitalocean_kubernetes_cluster.perceptacle.region
}

output "cluster_version" {
  description = "Kubernetes version of the cluster"
  value       = digitalocean_kubernetes_cluster.perceptacle.version
}

output "node_pool_id" {
  description = "ID of the default node pool"
  value       = digitalocean_kubernetes_cluster.perceptacle.node_pool[0].id
}

output "vpc_id" {
  description = "ID of the VPC (if created)"
  value       = var.create_vpc ? digitalocean_vpc.perceptacle[0].id : null
}
