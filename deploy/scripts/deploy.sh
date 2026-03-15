#!/bin/bash
# Perceptacle Helm Deployment Script
# Usage: ./deploy.sh <environment> [image-tag]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}
REGISTRY=${REGISTRY:-registry.digitalocean.com/perceptacle}

echo -e "${GREEN}=== Perceptacle Deployment ===${NC}"
echo "Environment: $ENVIRONMENT"
echo "Image Tag: $IMAGE_TAG"
echo "Registry: $REGISTRY"
echo ""

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}Error: Environment must be 'staging' or 'production'${NC}"
    exit 1
fi

# Check required tools
echo -e "${YELLOW}Checking required tools...${NC}"
command -v kubectl >/dev/null 2>&1 || { echo -e "${RED}kubectl is required but not installed.${NC}"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo -e "${RED}helm is required but not installed.${NC}"; exit 1; }
command -v doctl >/dev/null 2>&1 || { echo -e "${RED}doctl (DigitalOcean CLI) is required but not installed. Install from: https://docs.digitalocean.com/reference/doctl/how-to/install/${NC}"; exit 1; }

# Verify doctl is authenticated
if ! doctl account get >/dev/null 2>&1; then
    echo -e "${RED}doctl is not authenticated. Run 'doctl auth init' first.${NC}"
    exit 1
fi
echo -e "${GREEN}All required tools are available.${NC}"

# Set namespace
NAMESPACE="perceptacle-$ENVIRONMENT"
CLUSTER_NAME="perceptacle-$ENVIRONMENT"

# Navigate to helm chart directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHART_DIR="$SCRIPT_DIR/../helm/perceptacle"

if [[ ! -d "$CHART_DIR" ]]; then
    echo -e "${RED}Helm chart directory not found: $CHART_DIR${NC}"
    exit 1
fi

# Check if cluster is accessible
echo -e "${YELLOW}Checking cluster connection...${NC}"
if ! kubectl cluster-info > /dev/null 2>&1; then
    echo -e "${YELLOW}Configuring kubectl for cluster: $CLUSTER_NAME${NC}"
    doctl kubernetes cluster kubeconfig save "$CLUSTER_NAME"
fi

kubectl cluster-info

# Create namespace if not exists
echo -e "${YELLOW}Creating namespace if not exists...${NC}"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Create registry secret if not exists
echo -e "${YELLOW}Creating registry secret...${NC}"
if [[ -n "$DIGITALOCEAN_ACCESS_TOKEN" ]]; then
    kubectl create secret docker-registry do-registry \
        --docker-server=registry.digitalocean.com \
        --docker-username="$DIGITALOCEAN_ACCESS_TOKEN" \
        --docker-password="$DIGITALOCEAN_ACCESS_TOKEN" \
        --namespace="$NAMESPACE" \
        --dry-run=client -o yaml | kubectl apply -f -
else
    echo -e "${YELLOW}Warning: DIGITALOCEAN_ACCESS_TOKEN not set. Assuming registry secret already exists.${NC}"
fi

# Build Helm values arguments
VALUES_ARGS="-f $CHART_DIR/values.yaml -f $CHART_DIR/values-$ENVIRONMENT.yaml"

# Add image settings
HELM_ARGS="
    --set global.imageRegistry=$REGISTRY
    --set global.imagePullSecrets[0].name=do-registry
    --set client.image.tag=$IMAGE_TAG
    --set server.image.tag=$IMAGE_TAG
    --set agents.image.tag=$IMAGE_TAG
"

# Add secrets from environment variables if set
if [[ -n "$POSTGRES_PASSWORD" ]]; then
    HELM_ARGS="$HELM_ARGS --set postgresql.auth.password=$POSTGRES_PASSWORD"
fi

if [[ -n "$DATABASE_URL" ]]; then
    HELM_ARGS="$HELM_ARGS --set server.secrets.databaseUrl=$DATABASE_URL"
fi

if [[ -n "$SESSION_SECRET" ]]; then
    HELM_ARGS="$HELM_ARGS --set server.secrets.sessionSecret=$SESSION_SECRET"
fi

if [[ -n "$OPENAI_API_KEY" ]]; then
    HELM_ARGS="$HELM_ARGS --set server.secrets.openaiApiKey=$OPENAI_API_KEY"
    HELM_ARGS="$HELM_ARGS --set agents.secrets.openaiApiKey=$OPENAI_API_KEY"
fi

if [[ -n "$ANTHROPIC_API_KEY" ]]; then
    HELM_ARGS="$HELM_ARGS --set server.secrets.anthropicApiKey=$ANTHROPIC_API_KEY"
    HELM_ARGS="$HELM_ARGS --set agents.secrets.anthropicApiKey=$ANTHROPIC_API_KEY"
fi

# Helm lint
echo -e "${YELLOW}Linting Helm chart...${NC}"
helm lint "$CHART_DIR" $VALUES_ARGS

# Helm diff (if plugin installed)
if helm plugin list | grep -q diff; then
    echo -e "${YELLOW}Showing changes (helm diff)...${NC}"
    helm diff upgrade perceptacle "$CHART_DIR" \
        --namespace "$NAMESPACE" \
        $VALUES_ARGS \
        $HELM_ARGS \
        --allow-unreleased || true
fi

# Prompt for confirmation in production
if [[ "$ENVIRONMENT" == "production" ]]; then
    echo ""
    echo -e "${RED}WARNING: You are about to deploy to PRODUCTION!${NC}"
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [[ "$CONFIRM" != "yes" ]]; then
        echo "Deployment aborted."
        exit 0
    fi
fi

# Deploy with Helm
echo -e "${YELLOW}Deploying Perceptacle...${NC}"
helm upgrade --install perceptacle "$CHART_DIR" \
    --namespace "$NAMESPACE" \
    $VALUES_ARGS \
    $HELM_ARGS \
    --wait \
    --timeout 10m

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
kubectl rollout status deployment/perceptacle-client -n "$NAMESPACE" --timeout=5m
kubectl rollout status deployment/perceptacle-server -n "$NAMESPACE" --timeout=5m
kubectl rollout status deployment/perceptacle-agents -n "$NAMESPACE" --timeout=5m

# Print status
echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo -e "${YELLOW}Pods:${NC}"
kubectl get pods -n "$NAMESPACE"

echo ""
echo -e "${YELLOW}Services:${NC}"
kubectl get svc -n "$NAMESPACE"

echo ""
echo -e "${YELLOW}Ingress:${NC}"
kubectl get ingress -n "$NAMESPACE"

# Get external IP
echo ""
echo -e "${YELLOW}External Access:${NC}"
LB_IP=$(kubectl get svc -n ingress-nginx nginx-ingress-ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "pending")
echo "Load Balancer IP: $LB_IP"

echo ""
echo -e "${GREEN}Deployment successful!${NC}"
