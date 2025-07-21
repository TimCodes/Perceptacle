
# Mono Repo Architecture Requirements Document

## Project Overview
Transform the existing GitHub Manager system diagram application into a mono repo architecture with three distinct packages: Client, Server, and Core, each containerized using Docker.

## Current State Analysis
- **Frontend**: React + TypeScript application with Vite
- **Backend**: Express.js server with TypeScript  
- **Architecture**: Monolithic structure with client and server folders
- **Tech Stack**: React, Express, TypeScript, Tailwind CSS, shadcn/ui, React Flow, Zustand

## Target Architecture

### Package Structure
```
packages/
├── client/           # Frontend React application
├── server/           # Backend Express API
├── core/             # Shared utilities and types
└── docker-compose.yml
```

### Package Responsibilities

#### 1. Client Package (`packages/client/`)
**Purpose**: Frontend React application for system diagram management

**Dependencies**:
- Core package (shared types, utilities)
- External: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Flow

**Key Features**:
- Diagram canvas with React Flow
- Node type management interface  
- Component library for GCP services
- Theme management (dark/light)
- Responsive UI with sidebar panels

**Docker Requirements**:
- Node.js 20 base image
- Nginx for serving built assets
- Development and production configurations
- Hot reload capability in development

#### 2. Server Package (`packages/server/`)
**Purpose**: Backend API server for data management and business logic

**Dependencies**:
- Core package (shared types, utilities)
- External: Express.js, TypeScript, database drivers

**Key Features**:
- REST API endpoints for diagram management
- Node type CRUD operations
- Custom component storage
- Session management
- File storage capabilities

**Docker Requirements**:
- Node.js 20 base image
- Express server configuration
- Environment variable management
- Health check endpoints
- Database connectivity

#### 3. Core Package (`packages/core/`)
**Purpose**: Shared utilities, types, and common functionality

**Exports**:
- TypeScript interfaces and types
- Validation schemas (Zod)
- Utility functions
- Constants and enums
- Common business logic

**Key Components**:
- Node/Component type definitions
- Diagram data structures
- API response/request types
- Validation utilities
- Helper functions

## Technical Requirements

### Docker Configuration

#### Development Environment
- Docker Compose for orchestrating all services
- Volume mounting for hot reload
- Network configuration for inter-service communication
- Environment-specific configurations

#### Production Environment  
- Multi-stage Docker builds
- Optimized image sizes
- Health checks for all services
- Proper logging configuration

### Package Management
- Workspace configuration (npm workspaces or Yarn workspaces)
- Shared dependency management
- Build orchestration across packages
- Cross-package imports and references

### Development Workflow
- Individual package development capability
- Integrated development with docker-compose
- Hot reload for all packages
- Consistent linting and formatting across packages

## Migration Plan

### Phase 1: Project Restructuring
1. Create packages directory structure
2. Move existing client code to `packages/client/`
3. Move existing server code to `packages/server/`
4. Create `packages/core/` with shared utilities

### Phase 2: Core Package Development
1. Extract shared types from client and server
2. Create common utilities and helpers
3. Implement validation schemas
4. Set up cross-package imports

### Phase 3: Containerization
1. Create Dockerfiles for each package
2. Implement docker-compose configuration
3. Configure development and production environments
4. Set up networking and volume mounting

### Phase 4: Integration & Testing
1. Verify cross-package communication
2. Test hot reload functionality
3. Validate production builds
4. Performance optimization

## Success Criteria

### Functional Requirements
- [ ] All existing features work in new architecture
- [ ] Hot reload works in development
- [ ] Production builds are optimized
- [ ] Cross-package imports function correctly

### Non-Functional Requirements
- [ ] Build time < 2 minutes for full rebuild
- [ ] Development startup < 30 seconds
- [ ] Container images < 500MB each
- [ ] Zero breaking changes to existing APIs

### Development Experience
- [ ] Simple commands for development (`docker-compose up`)
- [ ] Individual package development capability
- [ ] Consistent code formatting across packages
- [ ] Clear documentation for new developers

## File Structure Template
```
packages/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   └── vite.config.ts
├── server/
│   ├── src/
│   ├── package.json
│   ├── Dockerfile
│   └── Dockerfile.dev
├── core/
│   ├── src/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── package.json (workspace root)
└── README.md
```

## Environment Configuration
- Development: Hot reload, source maps, debug logging
- Production: Optimized builds, minification, proper logging
- Environment variables for service URLs and configurations
- Secrets management for sensitive data

## Next Steps
1. Create the package structure
2. Set up workspace configuration
3. Migrate existing code to packages
4. Implement Docker configurations
5. Test and validate the new architecture
