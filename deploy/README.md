# Perceptacle Kubernetes Deployment

This directory contains all the infrastructure and deployment configurations for Perceptacle on DigitalOcean Kubernetes (DOKS).

## Architecture

```
                    DigitalOcean Cloud
┌─────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────┐    │
│  │            DOKS Cluster (3 nodes)               │    │
│  │  ┌─────────────────────────────────────────┐    │    │
│  │  │  nginx-ingress + cert-manager (TLS)     │    │    │
│  │  └──────────────────┬──────────────────────┘    │    │
│  │                     │                           │    │
│  │  ┌─────────┐ ┌──────┴─────┐ ┌─────────────┐    │    │
│  │  │ Client  │ │   Server   │ │   Agents    │    │    │
│  │  │ (Nginx) │ │ (Express)  │ │ (FastAPI)   │    │    │
│  │  │  2 pods │ │   2 pods   │ │   2 pods    │    │    │
│  │  └─────────┘ └──────┬─────┘ └─────────────┘    │    │
│  │                     │                           │    │
│  │  ┌──────────────────┴──────────────────────┐   │    │
│  │  │    PostgreSQL (StatefulSet or Managed)   │   │    │
│  │  └─────────────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌──────────────┐  ┌────────────────────────────┐      │
│  │ DO Container │  │ DO Managed DB (Production) │      │
│  │   Registry   │  └────────────────────────────┘      │
│  └──────────────┘                                       │
└─────────────────────────────────────────────────────────┘
```

## Directory Structure

```
deploy/
├── helm/
│   └── perceptacle/           # Umbrella Helm chart
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-staging.yaml
│       ├── values-production.yaml
│       └── charts/
│           ├── client/        # React frontend
│           ├── server/        # Express backend
│           ├── agents/        # FastAPI service
│           └── postgresql/    # Database (staging)
├── terraform/
│   ├── modules/
│   │   ├── doks-cluster/      # DOKS cluster
│   │   ├── do-registry/       # Container registry
│   │   └── do-database/       # Managed PostgreSQL
│   └── environments/
│       ├── staging/
│       └── production/
└── scripts/
    ├── setup-cluster.sh       # Remote cluster setup
    ├── deploy.sh              # Remote deployment
    ├── local-deploy.sh        # Docker Compose local dev
    └── local-k8s-deploy.sh    # Local Kubernetes deployment
```

## Prerequisites

1. **Tools Required**:
   - `doctl` - DigitalOcean CLI
   - `kubectl` - Kubernetes CLI
   - `helm` - Kubernetes package manager
   - `terraform` - Infrastructure as Code

2. **DigitalOcean Account**:
   - API token with read/write access
   - Container Registry subscription

## Quick Start

### Local Development with Kubernetes

For local development using a local Kubernetes cluster (kind, minikube, k3d, or Docker Desktop):

```bash
cd deploy/scripts

# Full deployment (creates cluster, builds images, deploys)
./local-k8s-deploy.sh deploy

# Start port forwarding to access services
./local-k8s-deploy.sh forward

# View status
./local-k8s-deploy.sh status

# View logs
./local-k8s-deploy.sh logs

# Clean up everything
./local-k8s-deploy.sh destroy
```

**Services will be available at:**
- Client: http://localhost:5173
- Server API: http://localhost:3000
- Agents: http://localhost:8000
- Database: localhost:5432

**Prerequisites for local K8s:**
- Docker
- kubectl
- helm
- One of: kind (recommended), k3d, minikube, or Docker Desktop with Kubernetes enabled

### 1. Set up Infrastructure (Terraform)

```bash
# Authenticate with DigitalOcean
doctl auth init

# Navigate to environment
cd deploy/terraform/environments/staging

# Set your DO token
export TF_VAR_do_token="your-do-token"
export TF_VAR_letsencrypt_email="your@email.com"

# Initialize and apply
terraform init
terraform plan
terraform apply
```

### 2. Deploy Application (Helm)

```bash
# Using the deploy script
cd deploy/scripts

# Set required secrets
export POSTGRES_PASSWORD="your-password"
export SESSION_SECRET="your-session-secret"
export OPENAI_API_KEY="your-openai-key"
export ANTHROPIC_API_KEY="your-anthropic-key"

# Deploy to staging
./deploy.sh staging

# Deploy to production
./deploy.sh production v1.0.0
```

### 3. Manual Helm Deployment

```bash
# Configure kubectl
doctl kubernetes cluster kubeconfig save perceptacle-staging

# Deploy
helm upgrade --install perceptacle deploy/helm/perceptacle \
  --namespace perceptacle-staging \
  --values deploy/helm/perceptacle/values.yaml \
  --values deploy/helm/perceptacle/values-staging.yaml \
  --set postgresql.auth.password="your-password" \
  --wait
```

## GitHub Actions CI/CD

The following workflows are configured:

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | Push/PR | Lint, test, build verification |
| `build-images.yml` | Push to main | Build and push Docker images |
| `deploy-staging.yml` | Push to main | Auto-deploy to staging |
| `deploy-production.yml` | Release publish | Manual deploy to production |

### Required Secrets

Configure these in GitHub repository settings:

```
DIGITALOCEAN_ACCESS_TOKEN
POSTGRES_PASSWORD
SESSION_SECRET
OPENAI_API_KEY
ANTHROPIC_API_KEY
PRODUCTION_DATABASE_URL
AZURE_SUBSCRIPTION_ID
AZURE_CLIENT_ID
AZURE_CLIENT_SECRET
AZURE_TENANT_ID
GH_TOKEN
```

## Helm Values

### Default Configuration (values.yaml)

Contains base configuration for all environments.

### Staging (values-staging.yaml)

- Single replica per service
- In-cluster PostgreSQL
- Auto-scaling disabled
- Debug logging for agents

### Production (values-production.yaml)

- 2+ replicas per service
- HPA enabled (min: 2, max: 10)
- Managed PostgreSQL
- Production resource limits

## Ingress Routes

```yaml
paths:
  - path: /api      -> server:3000
  - path: /agents   -> agents:8000
  - path: /         -> client:80
```

## Resource Limits

| Service | CPU Request | CPU Limit | Memory Request | Memory Limit |
|---------|-------------|-----------|----------------|--------------|
| Client  | 150m        | 300m      | 192Mi          | 384Mi        |
| Server  | 500m        | 1000m     | 512Mi          | 1Gi          |
| Agents  | 500m        | 1000m     | 512Mi          | 1Gi          |

## Estimated Costs

| Component | Staging | Production |
|-----------|---------|------------|
| DOKS (3 nodes) | $48/mo | $144/mo |
| Load Balancer | $12/mo | $12/mo |
| Container Registry | $5/mo | $5/mo |
| Block Storage | $5/mo | $10/mo |
| Managed PostgreSQL | $15/mo | $15/mo |
| **Total** | **~$85/mo** | **~$186/mo** |

## Verification

### Check Deployment Status

```bash
# Check pods
kubectl get pods -n perceptacle-staging

# Check services
kubectl get svc -n perceptacle-staging

# Check ingress
kubectl get ingress -n perceptacle-staging

# Check HPA (production)
kubectl get hpa -n perceptacle-production
```

### Health Checks

```bash
# Client
curl https://your-domain.com/

# Server
curl https://your-domain.com/api/health

# Agents
curl https://your-domain.com/agents/health
```

### View Logs

```bash
# Server logs
kubectl logs -f deployment/perceptacle-server -n perceptacle-staging

# Client logs
kubectl logs -f deployment/perceptacle-client -n perceptacle-staging

# Agents logs
kubectl logs -f deployment/perceptacle-agents -n perceptacle-staging
```

## Troubleshooting

### Pods not starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n perceptacle-staging

# Check resource constraints
kubectl top pods -n perceptacle-staging
```

### Database connection issues

```bash
# Check PostgreSQL pod (staging)
kubectl logs statefulset/perceptacle-postgresql -n perceptacle-staging

# Test connection
kubectl exec -it deployment/perceptacle-server -n perceptacle-staging -- \
  wget -qO- http://localhost:3000/health
```

### TLS certificate issues

```bash
# Check cert-manager
kubectl get certificates -n perceptacle-staging
kubectl describe certificate perceptacle-tls -n perceptacle-staging

# Check ClusterIssuer
kubectl describe clusterissuer letsencrypt-prod
```

## Rollback

```bash
# List releases
helm history perceptacle -n perceptacle-staging

# Rollback to previous version
helm rollback perceptacle 1 -n perceptacle-staging

# Rollback to specific revision
helm rollback perceptacle <revision> -n perceptacle-production
```

## Scaling

### Manual Scaling

```bash
kubectl scale deployment perceptacle-server --replicas=3 -n perceptacle-staging
```

### HPA Configuration

Production uses HPA with:
- Target CPU: 70%
- Min replicas: 2
- Max replicas: 10

## Security

- All containers run as non-root users
- Read-only root filesystems
- Network policies (can be added)
- Secrets managed via Kubernetes Secrets
- TLS via cert-manager + Let's Encrypt
