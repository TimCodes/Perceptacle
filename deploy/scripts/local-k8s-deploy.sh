#!/bin/bash
# Perceptacle Local Kubernetes Deployment Script
# Usage: ./local-k8s-deploy.sh [command] [options]
#
# Commands:
#   setup     - Create local Kubernetes cluster
#   deploy    - Build images and deploy to local cluster
#   build     - Build Docker images only
#   load      - Load images into local cluster
#   upgrade   - Upgrade existing deployment
#   forward   - Start port forwarding to services
#   stop      - Stop port forwarding
#   delete    - Delete deployment (keep cluster)
#   destroy   - Delete deployment and cluster
#   status    - Show deployment status
#   logs      - View service logs
#   shell     - Open shell in pod
#   db        - Database operations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
HELM_CHART="$PROJECT_ROOT/deploy/helm/perceptacle"

# Configuration
NAMESPACE="perceptacle-local"
RELEASE_NAME="perceptacle"
CLUSTER_NAME="perceptacle-local"
K8S_PROVIDER=""  # Will be auto-detected or set by user

# Port forwarding PIDs file
PF_PIDS_FILE="/tmp/perceptacle-port-forwards.pids"

# Helper functions
print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  $1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}INFO:${NC} $1"
}

print_success() {
    echo -e "${GREEN}OK:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}WARN:${NC} $1"
}

print_error() {
    echo -e "${RED}ERROR:${NC} $1"
}

print_step() {
    echo -e "${CYAN}=>${NC} $1"
}

# Detect available Kubernetes provider
detect_k8s_provider() {
    if [[ -n "$K8S_PROVIDER" ]]; then
        return 0
    fi

    # Check for kind first (preferred for local dev)
    if command -v kind &> /dev/null; then
        K8S_PROVIDER="kind"
        return 0
    fi

    # Check for k3d
    if command -v k3d &> /dev/null; then
        K8S_PROVIDER="k3d"
        return 0
    fi

    # Check for minikube
    if command -v minikube &> /dev/null; then
        K8S_PROVIDER="minikube"
        return 0
    fi

    # Check for Docker Desktop Kubernetes
    if kubectl config get-contexts 2>/dev/null | grep -q "docker-desktop"; then
        K8S_PROVIDER="docker-desktop"
        return 0
    fi

    return 1
}

check_prerequisites() {
    local missing=()

    if ! command -v docker &> /dev/null; then
        missing+=("docker")
    fi

    if ! command -v kubectl &> /dev/null; then
        missing+=("kubectl")
    fi

    if ! command -v helm &> /dev/null; then
        missing+=("helm")
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        print_error "Missing required tools: ${missing[*]}"
        echo ""
        echo "Install instructions:"
        echo "  - docker: https://docs.docker.com/get-docker/"
        echo "  - kubectl: https://kubernetes.io/docs/tasks/tools/"
        echo "  - helm: https://helm.sh/docs/intro/install/"
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    if ! detect_k8s_provider; then
        print_error "No local Kubernetes provider found."
        echo ""
        echo "Install one of the following:"
        echo "  - kind (recommended): https://kind.sigs.k8s.io/docs/user/quick-start/#installation"
        echo "  - k3d: https://k3d.io/#installation"
        echo "  - minikube: https://minikube.sigs.k8s.io/docs/start/"
        echo ""
        echo "Or enable Kubernetes in Docker Desktop settings."
        exit 1
    fi

    print_success "Using Kubernetes provider: $K8S_PROVIDER"
}

# Cluster management functions
cluster_exists() {
    case "$K8S_PROVIDER" in
        kind)
            kind get clusters 2>/dev/null | grep -q "^${CLUSTER_NAME}$"
            ;;
        k3d)
            k3d cluster list 2>/dev/null | grep -q "$CLUSTER_NAME"
            ;;
        minikube)
            minikube profile list 2>/dev/null | grep -q "$CLUSTER_NAME"
            ;;
        docker-desktop)
            # Docker Desktop K8s is always "exists" if available
            kubectl config get-contexts 2>/dev/null | grep -q "docker-desktop"
            ;;
    esac
}

create_cluster() {
    if cluster_exists; then
        print_info "Cluster '$CLUSTER_NAME' already exists"
        switch_context
        return 0
    fi

    print_step "Creating Kubernetes cluster '$CLUSTER_NAME' using $K8S_PROVIDER..."

    case "$K8S_PROVIDER" in
        kind)
            # Create kind cluster with port mappings
            cat <<EOF | kind create cluster --name "$CLUSTER_NAME" --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
    extraPortMappings:
      - containerPort: 30080
        hostPort: 8080
        protocol: TCP
      - containerPort: 30000
        hostPort: 3000
        protocol: TCP
      - containerPort: 30800
        hostPort: 8000
        protocol: TCP
EOF
            ;;
        k3d)
            k3d cluster create "$CLUSTER_NAME" \
                --port "8080:30080@server:0" \
                --port "3000:30000@server:0" \
                --port "8000:30800@server:0"
            ;;
        minikube)
            minikube start --profile "$CLUSTER_NAME" \
                --cpus 4 \
                --memory 4096 \
                --driver docker
            ;;
        docker-desktop)
            print_info "Using Docker Desktop Kubernetes - ensure it's enabled in Docker settings"
            ;;
    esac

    switch_context
    print_success "Cluster created and context set"
}

switch_context() {
    case "$K8S_PROVIDER" in
        kind)
            kubectl config use-context "kind-${CLUSTER_NAME}"
            ;;
        k3d)
            kubectl config use-context "k3d-${CLUSTER_NAME}"
            ;;
        minikube)
            kubectl config use-context "$CLUSTER_NAME"
            ;;
        docker-desktop)
            kubectl config use-context "docker-desktop"
            ;;
    esac
}

delete_cluster() {
    print_step "Deleting cluster '$CLUSTER_NAME'..."

    case "$K8S_PROVIDER" in
        kind)
            kind delete cluster --name "$CLUSTER_NAME"
            ;;
        k3d)
            k3d cluster delete "$CLUSTER_NAME"
            ;;
        minikube)
            minikube delete --profile "$CLUSTER_NAME"
            ;;
        docker-desktop)
            print_warning "Cannot delete Docker Desktop Kubernetes cluster"
            print_info "Disable it in Docker Desktop settings if needed"
            ;;
    esac

    print_success "Cluster deleted"
}

# Image building
build_images() {
    print_header "Building Docker Images"

    cd "$PROJECT_ROOT"

    print_step "Building client image..."
    docker build -t perceptacle/client:local \
        -f packages/client/Dockerfile \
        packages/client

    print_step "Building server image..."
    docker build -t perceptacle/server:local \
        -f packages/server/Dockerfile \
        packages/server

    print_step "Building agents image..."
    docker build -t perceptacle/agents:local \
        -f packages/agents/Dockerfile \
        packages/agents

    print_success "All images built"
    echo ""
    docker images | grep perceptacle | head -5
}

# Load images into local cluster
load_images() {
    print_step "Loading images into $K8S_PROVIDER cluster..."

    case "$K8S_PROVIDER" in
        kind)
            kind load docker-image perceptacle/client:local --name "$CLUSTER_NAME"
            kind load docker-image perceptacle/server:local --name "$CLUSTER_NAME"
            kind load docker-image perceptacle/agents:local --name "$CLUSTER_NAME"
            ;;
        k3d)
            k3d image import perceptacle/client:local -c "$CLUSTER_NAME"
            k3d image import perceptacle/server:local -c "$CLUSTER_NAME"
            k3d image import perceptacle/agents:local -c "$CLUSTER_NAME"
            ;;
        minikube)
            # For minikube, use 'minikube image load' to transfer images from host
            minikube -p "$CLUSTER_NAME" image load perceptacle/client:local
            minikube -p "$CLUSTER_NAME" image load perceptacle/server:local
            minikube -p "$CLUSTER_NAME" image load perceptacle/agents:local
            ;;
        docker-desktop)
            # Docker Desktop shares the daemon, images are already available
            print_info "Using shared Docker daemon - images already available"
            ;;
    esac

    print_success "Images loaded into cluster"
}

# Helm deployment
deploy_helm() {
    print_header "Deploying with Helm"

    # Create namespace if not exists
    kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

    # Update helm dependencies
    print_step "Updating Helm dependencies..."
    helm dependency update "$HELM_CHART"

    # Deploy
    print_step "Installing/upgrading Helm release..."
    helm upgrade --install "$RELEASE_NAME" "$HELM_CHART" \
        --namespace "$NAMESPACE" \
        --values "$HELM_CHART/values.yaml" \
        --values "$HELM_CHART/values-local.yaml" \
        --wait \
        --timeout 5m

    print_success "Deployment complete"
}

# Port forwarding
start_port_forward() {
    print_header "Starting Port Forwarding"

    # Kill existing port forwards
    stop_port_forward 2>/dev/null || true

    # Wait for pods to be ready
    print_step "Waiting for pods to be ready..."
    kubectl wait --for=condition=ready pod \
        -l "app.kubernetes.io/instance=$RELEASE_NAME" \
        -n "$NAMESPACE" \
        --timeout=120s || true

    # Start port forwards
    echo "" > "$PF_PIDS_FILE"

    print_step "Forwarding client (port 5173)..."
    kubectl port-forward -n "$NAMESPACE" svc/perceptacle-client-client 5173:80 &
    echo $! >> "$PF_PIDS_FILE"

    print_step "Forwarding server (port 3000)..."
    kubectl port-forward -n "$NAMESPACE" svc/perceptacle-server-server 3000:3000 &
    echo $! >> "$PF_PIDS_FILE"

    print_step "Forwarding agents (port 8000)..."
    kubectl port-forward -n "$NAMESPACE" svc/perceptacle-agents-agents 8000:8000 &
    echo $! >> "$PF_PIDS_FILE"

    print_step "Forwarding database (port 5432)..."
    kubectl port-forward -n "$NAMESPACE" svc/perceptacle-postgresql-postgresql 5432:5432 &
    echo $! >> "$PF_PIDS_FILE"

    sleep 2

    echo ""
    print_success "Port forwarding active!"
    echo ""
    echo -e "${BLUE}Services available at:${NC}"
    echo "  Client:    http://localhost:5173"
    echo "  Server:    http://localhost:3000"
    echo "  Agents:    http://localhost:8000"
    echo "  Database:  localhost:5432"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop port forwarding${NC}"
    echo ""

    # Wait for user to stop
    wait
}

stop_port_forward() {
    if [[ -f "$PF_PIDS_FILE" ]]; then
        print_step "Stopping port forwarding..."
        while read -r pid; do
            if [[ -n "$pid" ]]; then
                kill "$pid" 2>/dev/null || true
            fi
        done < "$PF_PIDS_FILE"
        rm -f "$PF_PIDS_FILE"
        print_success "Port forwarding stopped"
    fi
}

# Commands
cmd_setup() {
    print_header "Setting Up Local Kubernetes"
    check_prerequisites
    create_cluster
    print_success "Local Kubernetes is ready!"
}

cmd_deploy() {
    print_header "Full Local Deployment"

    check_prerequisites

    # Create cluster if needed
    if ! cluster_exists; then
        create_cluster
    else
        switch_context
    fi

    # Build and load images
    build_images
    load_images

    # Deploy
    deploy_helm

    echo ""
    print_success "Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Start port forwarding: $0 forward"
    echo "  2. View status: $0 status"
    echo "  3. View logs: $0 logs"
    echo ""
}

cmd_build() {
    check_prerequisites
    build_images
}

cmd_load() {
    check_prerequisites
    switch_context
    load_images
}

cmd_upgrade() {
    print_header "Upgrading Deployment"

    check_prerequisites
    switch_context

    # Optionally rebuild images
    if [[ "${1:-}" == "--build" ]]; then
        build_images
        load_images
    fi

    deploy_helm
    print_success "Upgrade complete"
}

cmd_forward() {
    check_prerequisites
    switch_context
    start_port_forward
}

cmd_stop() {
    stop_port_forward
}

cmd_delete() {
    print_header "Deleting Deployment"

    check_prerequisites
    switch_context

    stop_port_forward 2>/dev/null || true

    print_step "Uninstalling Helm release..."
    helm uninstall "$RELEASE_NAME" -n "$NAMESPACE" 2>/dev/null || true

    print_step "Deleting namespace..."
    kubectl delete namespace "$NAMESPACE" --ignore-not-found

    print_success "Deployment deleted. Cluster still available."
}

cmd_destroy() {
    print_header "Destroying Everything"

    check_prerequisites

    stop_port_forward 2>/dev/null || true

    # Delete deployment first
    if cluster_exists; then
        switch_context
        helm uninstall "$RELEASE_NAME" -n "$NAMESPACE" 2>/dev/null || true
        kubectl delete namespace "$NAMESPACE" --ignore-not-found 2>/dev/null || true
    fi

    # Delete cluster
    delete_cluster

    # Clean up local images
    print_step "Removing local images..."
    docker rmi perceptacle/client:local 2>/dev/null || true
    docker rmi perceptacle/server:local 2>/dev/null || true
    docker rmi perceptacle/agents:local 2>/dev/null || true

    print_success "Everything cleaned up"
}

cmd_status() {
    print_header "Deployment Status"

    check_prerequisites
    switch_context

    echo -e "${BLUE}Cluster:${NC} $CLUSTER_NAME ($K8S_PROVIDER)"
    echo ""

    echo -e "${BLUE}Namespace: $NAMESPACE${NC}"
    echo ""

    echo -e "${CYAN}Pods:${NC}"
    kubectl get pods -n "$NAMESPACE" -o wide 2>/dev/null || echo "  No pods found"
    echo ""

    echo -e "${CYAN}Services:${NC}"
    kubectl get svc -n "$NAMESPACE" 2>/dev/null || echo "  No services found"
    echo ""

    echo -e "${CYAN}Helm Releases:${NC}"
    helm list -n "$NAMESPACE" 2>/dev/null || echo "  No releases found"
    echo ""

    # Health checks if port forwarding is active
    if [[ -f "$PF_PIDS_FILE" ]]; then
        echo -e "${CYAN}Health Checks (via port-forward):${NC}"
        for endpoint in "http://localhost:5173" "http://localhost:3000/health" "http://localhost:8000/health"; do
            if curl -s "$endpoint" > /dev/null 2>&1; then
                echo -e "  ${GREEN}OK${NC} $endpoint"
            else
                echo -e "  ${RED}--${NC} $endpoint"
            fi
        done
    else
        echo -e "${YELLOW}Start port forwarding to check health: $0 forward${NC}"
    fi
}

cmd_logs() {
    check_prerequisites
    switch_context

    local service=${1:-}

    if [[ -z "$service" ]]; then
        print_info "Showing logs for all pods..."
        kubectl logs -n "$NAMESPACE" -l "app.kubernetes.io/instance=$RELEASE_NAME" --all-containers --prefix -f
    else
        print_info "Showing logs for $service..."
        kubectl logs -n "$NAMESPACE" -l "app.kubernetes.io/name=$service" -f
    fi
}

cmd_shell() {
    check_prerequisites
    switch_context

    local service=${1:-server}
    local pod

    case "$service" in
        server|client|agents|postgresql)
            pod=$(kubectl get pods -n "$NAMESPACE" -l "app.kubernetes.io/name=$service" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available: server, client, agents, postgresql"
            exit 1
            ;;
    esac

    if [[ -z "$pod" ]]; then
        print_error "No pod found for service: $service"
        exit 1
    fi

    print_info "Opening shell in $pod..."

    if [[ "$service" == "postgresql" ]]; then
        kubectl exec -it -n "$NAMESPACE" "$pod" -- psql -U synapse -d synapse
    else
        kubectl exec -it -n "$NAMESPACE" "$pod" -- /bin/sh
    fi
}

cmd_db() {
    check_prerequisites
    switch_context

    local subcmd=${1:-help}

    # Helper function to get pod name with validation
    get_pod() {
        local label=$1
        local pod
        pod=$(kubectl get pods -n "$NAMESPACE" -l "$label" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)
        if [[ -z "$pod" ]]; then
            print_error "No pod found with label: $label"
            print_info "Make sure the deployment is running: $0 status"
            return 1
        fi
        echo "$pod"
    }

    case "$subcmd" in
        migrate|push)
            local server_pod
            server_pod=$(get_pod "app.kubernetes.io/name=server") || exit 1
            print_info "Running database migrations..."
            kubectl exec -n "$NAMESPACE" "$server_pod" -- npm run db:push
            print_success "Migrations complete"
            ;;
        psql|shell)
            local pg_pod
            pg_pod=$(get_pod "app.kubernetes.io/name=postgresql") || exit 1
            print_info "Connecting to PostgreSQL..."
            kubectl exec -it -n "$NAMESPACE" "$pg_pod" -- psql -U synapse -d synapse
            ;;
        reset)
            print_warning "This will delete all data in the database!"
            read -p "Are you sure? (yes/no): " confirm
            if [[ "$confirm" == "yes" ]]; then
                local pg_pod server_pod
                pg_pod=$(get_pod "app.kubernetes.io/name=postgresql") || exit 1
                server_pod=$(get_pod "app.kubernetes.io/name=server") || exit 1
                kubectl exec -n "$NAMESPACE" "$pg_pod" -- psql -U synapse -d synapse -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
                print_info "Running migrations..."
                kubectl exec -n "$NAMESPACE" "$server_pod" -- npm run db:push
                print_success "Database reset complete"
            fi
            ;;
        *)
            echo "Database commands:"
            echo "  migrate  - Run database migrations"
            echo "  psql     - Connect to PostgreSQL shell"
            echo "  reset    - Reset database (WARNING: deletes data)"
            ;;
    esac
}

cmd_help() {
    echo "Perceptacle Local Kubernetes Deployment"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Cluster Management:"
    echo "  setup              Create local Kubernetes cluster"
    echo "  destroy            Delete cluster and all resources"
    echo ""
    echo "Deployment:"
    echo "  deploy             Full deployment (build, load, deploy)"
    echo "  build              Build Docker images only"
    echo "  load               Load images into cluster"
    echo "  upgrade [--build]  Upgrade deployment (optionally rebuild)"
    echo "  delete             Delete deployment (keep cluster)"
    echo ""
    echo "Runtime:"
    echo "  forward            Start port forwarding to services"
    echo "  stop               Stop port forwarding"
    echo "  status             Show deployment status"
    echo "  logs [service]     View logs (all or: server, client, agents)"
    echo "  shell <service>    Open shell (server, client, agents, postgresql)"
    echo "  db <cmd>           Database (migrate, psql, reset)"
    echo ""
    echo "Examples:"
    echo "  $0 deploy          # Full local deployment"
    echo "  $0 forward         # Access services via localhost"
    echo "  $0 upgrade --build # Rebuild and redeploy"
    echo "  $0 logs server     # View server logs"
    echo "  $0 db migrate      # Run database migrations"
    echo ""
    echo "Supported K8s providers: kind (recommended), k3d, minikube, docker-desktop"
    echo ""
}

# Main
main() {
    local command=${1:-help}
    shift || true

    case "$command" in
        setup)
            cmd_setup "$@"
            ;;
        deploy)
            cmd_deploy "$@"
            ;;
        build)
            cmd_build "$@"
            ;;
        load)
            cmd_load "$@"
            ;;
        upgrade)
            cmd_upgrade "$@"
            ;;
        forward|port-forward)
            cmd_forward "$@"
            ;;
        stop)
            cmd_stop "$@"
            ;;
        delete|undeploy)
            cmd_delete "$@"
            ;;
        destroy|clean)
            cmd_destroy "$@"
            ;;
        status)
            cmd_status "$@"
            ;;
        logs)
            cmd_logs "$@"
            ;;
        shell|exec)
            cmd_shell "$@"
            ;;
        db)
            cmd_db "$@"
            ;;
        help|--help|-h)
            cmd_help
            ;;
        *)
            print_error "Unknown command: $command"
            echo ""
            cmd_help
            exit 1
            ;;
    esac
}

main "$@"
