# Outputs for DigitalOcean Managed PostgreSQL Module

output "cluster_id" {
  description = "ID of the database cluster"
  value       = digitalocean_database_cluster.postgresql.id
}

output "cluster_urn" {
  description = "URN of the database cluster"
  value       = digitalocean_database_cluster.postgresql.urn
}

output "host" {
  description = "Database host"
  value       = digitalocean_database_cluster.postgresql.host
  sensitive   = true
}

output "private_host" {
  description = "Private database host (for VPC connections)"
  value       = digitalocean_database_cluster.postgresql.private_host
  sensitive   = true
}

output "port" {
  description = "Database port"
  value       = digitalocean_database_cluster.postgresql.port
}

output "database" {
  description = "Database name"
  value       = digitalocean_database_db.synapse.name
}

output "user" {
  description = "Database user"
  value       = digitalocean_database_user.synapse.name
}

output "password" {
  description = "Database password"
  value       = digitalocean_database_user.synapse.password
  sensitive   = true
}

output "connection_uri" {
  description = "Full connection URI for the database"
  value       = digitalocean_database_cluster.postgresql.uri
  sensitive   = true
}

output "private_connection_uri" {
  description = "Private connection URI (for VPC connections)"
  value       = digitalocean_database_cluster.postgresql.private_uri
  sensitive   = true
}

output "connection_pool_uri" {
  description = "Connection pool URI (if created)"
  value       = var.create_connection_pool ? digitalocean_database_connection_pool.synapse[0].uri : null
  sensitive   = true
}

output "ca_certificate" {
  description = "CA certificate for SSL connections"
  value       = digitalocean_database_cluster.postgresql.ca_certificate
  sensitive   = true
}
