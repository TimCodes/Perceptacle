# Docker Setup for Synapse

This document provides comprehensive instructions for running Synapse using Docker and Docker Compose.

## Prerequisites

- Docker Desktop for Windows (with WSL2 backend recommended)
- Docker Compose (included with Docker Desktop)
- Git

## Quick Start

### Development Environment

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd Synapse
   cp .env.example .env
   ```

2. **Start development environment**:
   ```bash
   # Using npm script
   npm run docker:dev
   
   # Or using batch script (Windows)
   scripts/dev-start.bat
   
   # Or using docker-compose directly
   docker-compose -f docker-compose.dev.yml --env-file .env.development up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Backend Health: http://localhost:3000/health
   - Database: localhost:5432

### Production Environment

1. **Setup production environment**:
   ```bash
   cp .env.production .env.production.local
   # Edit .env.production.local with your production settings
   ```

2. **Start production environment**:
   ```bash
   # Using npm script
   npm run docker:prod
   
   # Or using batch script (Windows)
   scripts/prod-start.bat
   
   # Or using docker-compose directly
   docker-compose --env-file .env.production up --build -d
   ```

3. **Access the application**:
   - Frontend: http://localhost:80
   - Backend API: http://localhost:3000
   - Database: localhost:5432

## Architecture

### Containers

- **Synapse-client**: React frontend (Nginx in prod, Vite dev server in dev)
- **Synapse-server**: Express backend server
- **Synapse-db**: PostgreSQL database

### Networking

All containers communicate through a custom Docker network:
- Development: `Synapse-dev-network`
- Production: `Synapse-network`

### Volumes

- **postgres_data/postgres_dev_data**: Database persistence
- **Source code mounts** (dev only): Enable hot reload

## Environment Configuration

### Environment Files

- `.env.example`: Template with all available options
- `.env.development`: Development-specific settings
- `.env.production`: Production-specific settings
- `.env`: Local overrides (create from .env.example)

### Key Environment Variables

```bash
# Database
DB_NAME=Synapse_dev
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# Server
SERVER_PORT=3000
NODE_ENV=development

# Client
CLIENT_PORT=5173
VITE_API_URL=http://localhost:3000
```

## Development Workflow

### Hot Reload

Both frontend and backend support hot reload in development mode:
- Source code is mounted as volumes
- Changes are automatically detected and applied
- No need to rebuild containers for code changes

### Database Development

1. **Apply schema changes**:
   ```bash
   # From host machine
   cd server
   npm run db:push
   
   # Or from container
   docker-compose -f docker-compose.dev.yml exec server npm run db:push
   ```

2. **Open database studio**:
   ```bash
   # From host machine
   cd server
   npm run db:studio
   
   # Or from container
   docker-compose -f docker-compose.dev.yml exec server npm run db:studio
   ```

### Debugging

1. **View logs**:
   ```bash
   # All services
   npm run docker:logs
   
   # Specific service
   npm run docker:logs:server
   npm run docker:logs:client
   npm run docker:logs:db
   ```

2. **Execute commands in containers**:
   ```bash
   # Access server container
   docker-compose -f docker-compose.dev.yml exec server sh
   
   # Access database
   docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d Synapse_dev
   ```

## Useful Commands

### Container Management

```bash
# Start development environment
npm run docker:dev

# Stop all containers
npm run docker:dev:down

# Start production environment (detached)
npm run docker:prod

# Stop production environment
npm run docker:prod:down

# View logs (follow)
npm run docker:logs

# Clean up everything (containers, volumes, images)
npm run docker:clean
```

### Database Operations

```bash
# Apply database migrations
docker-compose -f docker-compose.dev.yml exec server npm run db:push

# Open database studio
docker-compose -f docker-compose.dev.yml exec server npm run db:studio

# Backup database
docker-compose -f docker-compose.dev.yml exec postgres pg_dump -U postgres Synapse_dev > backup.sql

# Restore database
docker-compose -f docker-compose.dev.yml exec -T postgres psql -U postgres Synapse_dev < backup.sql
```

### Development Helpers

```bash
# Rebuild specific service
docker-compose -f docker-compose.dev.yml build server

# Force recreate containers
docker-compose -f docker-compose.dev.yml up --force-recreate

# Run without cache
docker-compose -f docker-compose.dev.yml build --no-cache
```

## Troubleshooting

### Common Issues

1. **Port conflicts**:
   - Check if ports 5173, 3000, or 5432 are in use
   - Modify ports in environment files if needed

2. **Permission issues** (Linux/Mac):
   ```bash
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues**:
   - Ensure database container is healthy: `docker-compose ps`
   - Check database logs: `npm run docker:logs:db`

4. **Build failures**:
   - Clear Docker cache: `docker system prune -f`
   - Rebuild without cache: `docker-compose build --no-cache`

### Performance Optimization

1. **Use .dockerignore**: Already configured to exclude node_modules, etc.
2. **Multi-stage builds**: Implemented for smaller production images
3. **Health checks**: Configured for all services

### Security Considerations

1. **Production secrets**: Use Docker secrets or external secret management
2. **Non-root user**: Server runs as non-root user in production
3. **Network isolation**: Services communicate through internal network
4. **Environment separation**: Separate databases for dev/prod

## Monitoring

### Health Checks

All services include health checks:
- **Server**: `GET /health`
- **Client**: HTTP check on root
- **Database**: `pg_isready`

### Logs

Structured logging is available:
```bash
# Follow all logs
docker-compose logs -f

# Follow specific service
docker-compose logs -f server

# View last 100 lines
docker-compose logs --tail=100 server
```

## Deployment

For production deployment, consider:
1. Use production-grade PostgreSQL (managed service)
2. Implement proper secret management
3. Add reverse proxy (nginx/traefik)
4. Set up monitoring and alerting
5. Configure automated backups
6. Use orchestration (Docker Swarm/Kubernetes)

## Alternative: Traditional Development

If you prefer not to use Docker for development:
```bash
# Install dependencies
npm install
cd client && npm install
cd ../server && npm install

# Start development servers
npm run dev
```

This will run the traditional development setup with local Node.js.
