#!/bin/bash
# Perceptacle Kubernetes Cluster Setup Script
# This script sets up the DOKS cluster with required infrastructure components

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
REGION=${REGION:-nyc1}

echo -e "${GREEN}=== Perceptacle Cluster Setup ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Region: $REGION"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

# Check required tools
echo -e "${YELLOW}Checking required tools...${NC}"
command -v doctl >/dev/null 2>&1 || { echo -e "${RED}doctl is required but not installed.${NC}"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl is required but not installed.${NC}"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}helm is required but not installed.${NC}"; exit 1; }
command -v terraform >/dev/null 2>&1 || { echo -e "${RED}terraform is required but not installed.${NC}"; exit 1; }

echo -e "${GREEN}All required tools are installed.${NC}"
echo ""

# Check DigitalOcean authentication
echo -e "${YELLOW}Checking DigitalOcean authentication...${NC}"
doctl account get > /dev/null || { echo -e "${RED}Please authenticate with: doctl auth init${NC}"; exit 1; }
echo -e "${GREEN}DigitalOcean authentication verified.${NC}"
echo ""

# Navigate to terraform environment
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$SCRIPT_DIR/../terraform/environments/$ENVIRONMENT"

if [[ ! -d "$TF_DIR" ]]; then
    echo -e "${RED}Terraform directory not found: $TF_DIR${NC}"
    exit 1
fi

cd "$TF_DIR"

# Initialize Terraform
echo -e "${YELLOW}Initializing Terraform...${NC}"
terraform init

# Plan Terraform changes
echo -e "${YELLOW}Planning Terraform changes...${NC}"
terraform plan -out=tfplan

# Prompt for confirmation
echo ""
read -p "Do you want to apply these changes? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo "Aborted."
    exit 0
fi

# Apply Terraform changes
echo -e "${YELLOW}Applying Terraform changes...${NC}"
terraform apply tfplan

# Get cluster name from output
CLUSTER_NAME=$(terraform output -raw cluster_name 2>/dev/null || echo "perceptacle-$ENVIRONMENT")

# Configure kubectl
echo -e "${YELLOW}Configuring kubectl...${NC}"
doctl kubernetes cluster kubeconfig save "$CLUSTER_NAME"

# Verify cluster connection
echo -e "${YELLOW}Verifying cluster connection...${NC}"
kubectl cluster-info

# Wait for cluster to be ready
echo -e "${YELLOW}Waiting for cluster nodes to be ready...${NC}"
kubectl wait --for=condition=Ready nodes --all --timeout=300s

# List cluster nodes
echo -e "${GREEN}Cluster nodes:${NC}"
kubectl get nodes

# Wait for nginx-ingress to get external IP
echo -e "${YELLOW}Waiting for Load Balancer to be provisioned...${NC}"
echo "This may take a few minutes..."
for i in {1..60}; do
    LB_IP=$(kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "")
    if [[ -n "$LB_IP" ]]; then
        echo -e "${GREEN}Load Balancer IP: $LB_IP${NC}"
        break
    fi
    echo "Waiting... ($i/60)"
    sleep 10
done

if [[ -z "$LB_IP" ]]; then
    echo -e "${YELLOW}Warning: Load Balancer IP not yet available. Check later with:${NC}"
    echo "kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller"
fi

# Print summary
echo ""
echo -e "${GREEN}=== Setup Complete ===${NC}"
echo ""
echo "Cluster: $CLUSTER_NAME"
echo "Region: $REGION"
echo "Environment: $ENVIRONMENT"
if [[ -n "$LB_IP" ]]; then
    echo "Load Balancer IP: $LB_IP"
fi
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Configure DNS to point to the Load Balancer IP"
echo "2. Update values-$ENVIRONMENT.yaml with your domain"
echo "3. Set up GitHub secrets for CI/CD"
echo "4. Run: ./deploy.sh $ENVIRONMENT"
echo ""
echo -e "${GREEN}Registry endpoint:${NC}"
terraform output -raw registry_endpoint 2>/dev/null || echo "registry.digitalocean.com/perceptacle"
