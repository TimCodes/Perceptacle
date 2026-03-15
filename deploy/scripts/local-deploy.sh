#!/bin/bash
# Perceptacle Local Deployment Script
# Usage: ./local-deploy.sh [command] [options]
#
# Commands:
#   dev       - Start development environment with hot reload
#   prod      - Start production-like environment locally
#   build     - Build all Docker images locally
#   stop      - Stop all containers
#   clean     - Stop and remove all containers, volumes, and images
#   logs      - View logs for all services
#   status    - Show status of all services
#   shell     - Open shell in a service container
#   db        - Database operations (migrate, studio, reset)
#   test      - Run tests in containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Configuration
COMPOSE_PROJECT_NAME="perceptacle"
DEV_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"
PROD_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.yml"

# Helper functions
print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  $1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not installed."
        exit 1
    fi
}

# Use docker compose (v2) or docker-compose (v1)
docker_compose() {
    if docker compose version &> /dev/null 2>&1; then
        docker compose "$@"
    else
        docker-compose "$@"
    fi
}

setup_env() {
    local env_file="$PROJECT_ROOT/.env"
    local env_example="$PROJECT_ROOT/.env.example"

    if [[ ! -f "$env_file" ]]; then
        if [[ -f "$env_example" ]]; then
            print_warning ".env file not found. Creating from .env.example..."
            cp "$env_example" "$env_file"
            print_info "Please edit .env file with your configuration."
        else
            print_warning "No .env or .env.example found. Creating minimal .env..."
            cat > "$env_file" << 'EOF'
# Database
DB_NAME=synapse
DB_USER=synapse
DB_PASSWORD=localdev123
DB_PORT=5432
DATABASE_URL=postgresql://synapse:localdev123@postgres:5432/synapse

# Services
SERVER_PORT=3000
CLIENT_PORT=5173
AGENTS_PORT=8000
NODE_ENV=development

# Mock services for local development
USE_MOCK_SERVICES=true

# Optional: Add your API keys for full functionality
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
# GITHUB_TOKEN=
EOF
            print_success "Created .env file with default values."
        fi
    fi
}

wait_for_service() {
    local service=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1

    print_info "Waiting for $service to be ready..."

    while [[ $attempt -le $max_attempts ]]; do
        if curl -s "$url" > /dev/null 2>&1; then
            print_success "$service is ready!"
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done

    echo ""
    print_warning "$service may not be fully ready yet."
    return 1
}

# Commands
cmd_dev() {
    print_header "Starting Development Environment"

    check_docker
    setup_env
    cd "$PROJECT_ROOT"

    print_info "Starting services with hot reload..."
    docker_compose -f "$DEV_COMPOSE_FILE" up --build -d

    echo ""
    print_info "Waiting for services to start..."
    sleep 5

    # Wait for services
    wait_for_service "PostgreSQL" "localhost:5432" 30 || true
    wait_for_service "Server" "http://localhost:3000/health" 60 || true
    wait_for_service "Client" "http://localhost:5173" 60 || true
    wait_for_service "Agents" "http://localhost:8000/health" 60 || true

    echo ""
    print_success "Development environment is running!"
    echo ""
    echo -e "${BLUE}Services:${NC}"
    echo "  • Client (React):  http://localhost:5173"
    echo "  • Server (API):    http://localhost:3000"
    echo "  • Agents (Python): http://localhost:8000"
    echo "  • Database:        localhost:5432"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo "  • View logs:       $0 logs"
    echo "  • Stop services:   $0 stop"
    echo "  • Open DB studio:  $0 db studio"
    echo ""
}

cmd_prod() {
    print_header "Starting Production-like Environment"

    check_docker
    setup_env
    cd "$PROJECT_ROOT"

    print_info "Building and starting production containers..."
    docker_compose -f "$PROD_COMPOSE_FILE" up --build -d

    echo ""
    print_info "Waiting for services to start..."
    sleep 10

    # Wait for services
    wait_for_service "PostgreSQL" "localhost:5432" 30 || true
    wait_for_service "Server" "http://localhost:3000/health" 90 || true
    wait_for_service "Client" "http://localhost:80" 60 || true
    wait_for_service "Agents" "http://localhost:8000/health" 60 || true

    echo ""
    print_success "Production environment is running!"
    echo ""
    echo -e "${BLUE}Services:${NC}"
    echo "  • Client (Nginx):  http://localhost:80"
    echo "  • Server (API):    http://localhost:3000"
    echo "  • Agents (Python): http://localhost:8000"
    echo "  • Database:        localhost:5432"
    echo ""
}

cmd_build() {
    print_header "Building Docker Images"

    check_docker
    cd "$PROJECT_ROOT"

    local target=${1:-production}

    print_info "Building images with target: $target"

    echo ""
    print_info "Building client image..."
    docker build -t perceptacle/client:local \
        --target "$target" \
        -f packages/client/Dockerfile \
        packages/client

    echo ""
    print_info "Building server image..."
    docker build -t perceptacle/server:local \
        --target "$target" \
        -f packages/server/Dockerfile \
        packages/server

    echo ""
    print_info "Building agents image..."
    docker build -t perceptacle/agents:local \
        --target "$target" \
        -f packages/agents/Dockerfile \
        packages/agents

    echo ""
    print_success "All images built successfully!"
    echo ""
    docker images | grep perceptacle
}

cmd_stop() {
    print_header "Stopping Services"

    cd "$PROJECT_ROOT"

    print_info "Stopping development containers..."
    docker_compose -f "$DEV_COMPOSE_FILE" down 2>/dev/null || true

    print_info "Stopping production containers..."
    docker_compose -f "$PROD_COMPOSE_FILE" down 2>/dev/null || true

    print_success "All services stopped."
}

cmd_clean() {
    print_header "Cleaning Up"

    cd "$PROJECT_ROOT"

    print_warning "This will remove all containers, volumes, and local images."
    read -p "Are you sure? (yes/no): " confirm

    if [[ "$confirm" != "yes" ]]; then
        echo "Aborted."
        exit 0
    fi

    print_info "Stopping and removing containers..."
    docker_compose -f "$DEV_COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true
    docker_compose -f "$PROD_COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true

    print_info "Removing local images..."
    docker rmi perceptacle/client:local 2>/dev/null || true
    docker rmi perceptacle/server:local 2>/dev/null || true
    docker rmi perceptacle/agents:local 2>/dev/null || true

    print_info "Pruning unused Docker resources..."
    docker system prune -f

    print_success "Cleanup complete."
}

cmd_logs() {
    cd "$PROJECT_ROOT"

    local service=${1:-}
    local compose_file="$DEV_COMPOSE_FILE"

    # Check which compose file is running
    if docker_compose -f "$PROD_COMPOSE_FILE" ps -q 2>/dev/null | grep -q .; then
        compose_file="$PROD_COMPOSE_FILE"
    fi

    if [[ -n "$service" ]]; then
        print_info "Showing logs for $service..."
        docker_compose -f "$compose_file" logs -f "$service"
    else
        print_info "Showing logs for all services (Ctrl+C to exit)..."
        docker_compose -f "$compose_file" logs -f
    fi
}

cmd_status() {
    print_header "Service Status"

    cd "$PROJECT_ROOT"

    echo -e "${BLUE}Development Environment:${NC}"
    docker_compose -f "$DEV_COMPOSE_FILE" ps 2>/dev/null || echo "  Not running"

    echo ""
    echo -e "${BLUE}Production Environment:${NC}"
    docker_compose -f "$PROD_COMPOSE_FILE" ps 2>/dev/null || echo "  Not running"

    echo ""
    echo -e "${BLUE}Health Checks:${NC}"

    # Check each service
    for service in "Client:http://localhost:5173" "Client (Prod):http://localhost:80" "Server:http://localhost:3000/health" "Agents:http://localhost:8000/health"; do
        name="${service%%:*}"
        url="${service#*:}"
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} $name ($url)"
        else
            echo -e "  ${RED}✗${NC} $name ($url)"
        fi
    done
}

cmd_shell() {
    local service=${1:-server}

    cd "$PROJECT_ROOT"

    local compose_file="$DEV_COMPOSE_FILE"
    if docker_compose -f "$PROD_COMPOSE_FILE" ps -q 2>/dev/null | grep -q .; then
        compose_file="$PROD_COMPOSE_FILE"
    fi

    print_info "Opening shell in $service container..."

    case "$service" in
        server|client)
            docker_compose -f "$compose_file" exec "$service" /bin/sh
            ;;
        agents)
            docker_compose -f "$compose_file" exec "$service" /bin/bash
            ;;
        postgres|db)
            docker_compose -f "$compose_file" exec postgres psql -U synapse -d synapse
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available: server, client, agents, postgres"
            exit 1
            ;;
    esac
}

cmd_db() {
    local subcmd=${1:-help}

    cd "$PROJECT_ROOT"

    case "$subcmd" in
        migrate|push)
            print_info "Running database migrations..."
            docker_compose -f "$DEV_COMPOSE_FILE" exec server npm run db:push
            print_success "Migrations complete."
            ;;
        studio)
            print_info "Starting Drizzle Studio..."
            print_info "Open http://localhost:4983 in your browser"
            cd packages/server && npm run db:studio
            ;;
        reset)
            print_warning "This will delete all data in the database!"
            read -p "Are you sure? (yes/no): " confirm
            if [[ "$confirm" == "yes" ]]; then
                docker_compose -f "$DEV_COMPOSE_FILE" exec postgres psql -U synapse -d synapse -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
                print_info "Running migrations..."
                docker_compose -f "$DEV_COMPOSE_FILE" exec server npm run db:push
                print_success "Database reset complete."
            fi
            ;;
        *)
            echo "Database commands:"
            echo "  migrate  - Run database migrations"
            echo "  studio   - Open Drizzle Studio"
            echo "  reset    - Reset database (WARNING: deletes all data)"
            ;;
    esac
}

cmd_test() {
    print_header "Running Tests"

    cd "$PROJECT_ROOT"

    local service=${1:-all}

    case "$service" in
        client)
            print_info "Running client tests..."
            docker_compose -f "$DEV_COMPOSE_FILE" exec client npm test
            ;;
        server)
            print_info "Running server tests..."
            docker_compose -f "$DEV_COMPOSE_FILE" exec server npm test
            ;;
        agents)
            print_info "Running agents tests..."
            docker_compose -f "$DEV_COMPOSE_FILE" exec agents pytest tests/ -v
            ;;
        all)
            print_info "Running all tests..."
            docker_compose -f "$DEV_COMPOSE_FILE" exec client npm test -- --passWithNoTests || true
            docker_compose -f "$DEV_COMPOSE_FILE" exec server npm test -- --passWithNoTests || true
            docker_compose -f "$DEV_COMPOSE_FILE" exec agents pytest tests/ -v || true
            ;;
        *)
            print_error "Unknown service: $service"
            echo "Available: client, server, agents, all"
            exit 1
            ;;
    esac
}

cmd_help() {
    echo "Perceptacle Local Deployment Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  dev              Start development environment (hot reload)"
    echo "  prod             Start production-like environment"
    echo "  build [target]   Build Docker images (default: production)"
    echo "  stop             Stop all containers"
    echo "  clean            Remove containers, volumes, and images"
    echo "  logs [service]   View logs (all or specific service)"
    echo "  status           Show service status and health"
    echo "  shell <service>  Open shell (server, client, agents, postgres)"
    echo "  db <cmd>         Database ops (migrate, studio, reset)"
    echo "  test [service]   Run tests (client, server, agents, all)"
    echo "  help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 dev                  # Start dev environment"
    echo "  $0 logs server          # View server logs"
    echo "  $0 shell postgres       # Connect to database"
    echo "  $0 db migrate           # Run migrations"
    echo "  $0 test server          # Run server tests"
    echo ""
}

# Main
main() {
    local command=${1:-help}
    shift || true

    case "$command" in
        dev)
            cmd_dev "$@"
            ;;
        prod)
            cmd_prod "$@"
            ;;
        build)
            cmd_build "$@"
            ;;
        stop)
            cmd_stop "$@"
            ;;
        clean)
            cmd_clean "$@"
            ;;
        logs)
            cmd_logs "$@"
            ;;
        status)
            cmd_status "$@"
            ;;
        shell)
            cmd_shell "$@"
            ;;
        db)
            cmd_db "$@"
            ;;
        test)
            cmd_test "$@"
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
