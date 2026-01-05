# Perceptacle Documentation

## Project Purpose

Perceptacle is a comprehensive infrastructure and telemetry diagram builder designed for DevOps engineers, SREs, and architects. It provides an interactive canvas for creating, managing, and monitoring infrastructure diagrams with real-time integrations to various cloud platforms and services including Kubernetes, GitHub, Azure, MongoDB, Oracle, and Kafka.

The application enables teams to:
- Visualize infrastructure topology and service dependencies
- Monitor real-time metrics and logs from connected services
- Track CI/CD pipeline status and GitHub workflows
- Manage tickets and issues directly from diagram nodes
- Query and interact with infrastructure using RAG-powered AI assistance
- Save and share telemetry maps with team members

## Application Scope

Perceptacle is built as a modern full-stack monorepo application with clear separation between client and server:

- **Frontend**: React 18 + TypeScript + ReactFlow for interactive diagram building
- **Backend**: Express + TypeScript API server with WebSocket support
- **Database**: PostgreSQL with Drizzle ORM for data persistence
- **Integrations**: Native SDKs for Kubernetes, GitHub, Azure, MongoDB, Oracle, and Kafka
- **AI Capabilities**: OpenAI integration and RAG (Retrieval Augmented Generation) service
- **Python Agents**: Supervisor agent service for advanced automation

## Key Technologies

### Frontend Stack
- **React 18.3.1** - UI framework
- **TypeScript 5.6.3** - Type-safe development
- **ReactFlow 11.11.4** - Interactive node-based diagrams
- **Wouter 3.3.5** - Lightweight routing
- **Zustand 5.0.3** - State management
- **TanStack Query 5.60.5** - Server state management
- **Radix UI** - Accessible component primitives
- **Tailwind CSS 3.4.14** - Utility-first styling
- **Framer Motion 6.5.1** - Animations
- **Vite 5.4.9** - Build tool and dev server

### Backend Stack
- **Express 4.21.2** - Web framework
- **TypeScript 5.6.3** - Type-safe development
- **Drizzle ORM 0.38.2** - Database ORM
- **PostgreSQL** - Primary database
- **WebSocket (ws 8.18.0)** - Real-time communication
- **OpenAI 4.83.0** - AI integration
- **Octokit** - GitHub API client
- **@kubernetes/client-node** - Kubernetes API client
- **@azure/service-bus** - Azure Service Bus client

### Development Tools
- **Jest 29.7.0** - Testing framework
- **Testing Library** - React component testing
- **Docker & Docker Compose** - Containerization
- **ESBuild 0.24.0** - Fast TypeScript compilation
- **Drizzle Kit 0.27.1** - Database migrations

## Documentation Navigation

### Getting Started
- [Project README](../README.md) - Setup and installation instructions
- [Docker Setup](./DOCKER.md) - Container-based development

### Architecture & Design
- [Architecture Overview](./architecture.md) - System design, layers, and patterns
- [Functional Overview](./functional-overview.md) - Core features and workflows
- [Flow Diagrams](./flow-diagrams.md) - Sequence diagrams and state flows

### API & Services Documentation
- [GitHub Service](../packages/server/GITHUB_SERVICE.md) - GitHub integration details
- [Kubernetes Service](../packages/server/KUBERNETES_SERVICE.md) - Kubernetes integration
- [Azure Service](../packages/server/AZURE_SERVICE.md) - Azure Service Bus integration
- [RAG Service](../packages/server/RAG_SERVICE.md) - AI-powered query service
- [AI Chat Implementation](../packages/server/AICHAT_IMPLEMENTATION.md) - OpenAI chat integration

### Component Documentation
- [File-Level Documentation](./files/) - Detailed per-file analysis
  - [Client Files](./files/client/) - React components, pages, utilities
  - [Server Files](./files/server/) - Routes, services, database

### Testing
- [Server Testing](../packages/server/TEST_SUMMARY.md) - Backend test coverage
- [Client Testing](../packages/client/TESTING.md) - Frontend test setup

## Diagram Index

All diagrams are created using Mermaid syntax for easy rendering in Markdown viewers and GitHub.

### High-Level Architecture Diagrams
1. [System Architecture](./architecture.md#system-architecture) - Overall system structure
2. [Data Flow](./architecture.md#data-flow) - Request/response flow through layers
3. [Deployment Architecture](./architecture.md#deployment-architecture) - Container and service deployment

### Sequence Diagrams
1. [User Creates Diagram](./flow-diagrams.md#diagram-creation-flow) - New diagram creation workflow
2. [Load Existing Map](./flow-diagrams.md#map-loading-flow) - Loading saved telemetry maps
3. [Node Configuration](./flow-diagrams.md#node-configuration-flow) - Configuring node properties
4. [Real-time Metrics](./flow-diagrams.md#metrics-retrieval-flow) - Fetching live metrics
5. [GitHub Integration](./flow-diagrams.md#github-integration-flow) - PR and workflow status
6. [AI Chat Interaction](./flow-diagrams.md#ai-chat-flow) - RAG-powered assistance

### Component Interaction Diagrams
1. [Frontend Component Tree](./architecture.md#component-hierarchy) - React component structure
2. [API Route Structure](./architecture.md#api-routes) - Backend endpoint organization
3. [State Management](./architecture.md#state-management) - Zustand store architecture

## Major Documentation Sections

### Architecture Documentation
Comprehensive coverage of:
- System layers (presentation, business logic, data access, external integrations)
- Design patterns (Repository, Factory, Observer, MVC-like structure)
- Security considerations (CORS, authentication, API token management)
- Performance optimizations (caching, pagination, connection pooling)

[→ Read Architecture Documentation](./architecture.md)

### Functional Overview
Detailed explanation of:
- Core diagram building features
- Real-time integration capabilities
- User workflows from creation to monitoring
- Module responsibilities and boundaries
- Constraints and assumptions

[→ Read Functional Overview](./functional-overview.md)

### Flow Diagrams
Visual representations of:
- User interaction flows
- API request sequences
- WebSocket communication patterns
- Service integration workflows
- Error handling paths

[→ Read Flow Diagrams](./flow-diagrams.md)

### File Documentation
Every source file documented with:
- Purpose and responsibilities
- Function signatures and descriptions
- Parameter and return value documentation
- Dependencies and relationships
- Error handling strategies
- Cross-references to related files

[→ Browse File Documentation](./files/)

## Quick Links

### Client Application
- [App Entry Point](./files/client/main.md) - Application bootstrap
- [Main App Component](./files/client/App.md) - Root component and routing
- [Diagram Canvas](./files/client/components/DiagramCanvas.md) - Core diagram editor
- [State Store](./files/client/utils/diagram-store.md) - Zustand state management

### Server Application
- [Server Entry Point](./files/server/index.md) - Express server setup
- [Route Registration](./files/server/routes.md) - API endpoint configuration
- [Database Schema](./files/server/db/schema.md) - PostgreSQL table definitions
- [Service Factory](./files/server/services/service-factory.md) - Service instantiation

### Key Integrations
- [GitHub Service](./files/server/services/github.md) - Pull requests, workflows, issues
- [Kubernetes Service](./files/server/services/kubernetes.md) - Pods, services, metrics
- [Azure Service](./files/server/services/azure.md) - Service Bus messaging
- [RAG Service](./files/server/services/rag.md) - AI-powered queries

## Development Workflow

1. **Local Development**: `npm run dev` - Runs both client and server with hot reload
2. **Docker Development**: `npm run docker:dev` - Full containerized environment
3. **Testing**: `npm test` - Runs both client and server test suites
4. **Database Management**: `npm run db:studio` - Opens Drizzle Studio
5. **Build**: `npm run build` - Production builds for both packages

## Contributing Guidelines

When working with this codebase:
- Follow existing TypeScript patterns and conventions
- Maintain comprehensive JSDoc comments for public APIs
- Add tests for new functionality
- Update relevant documentation when adding features
- Use the established error handling patterns
- Follow the service factory pattern for new integrations

## License

MIT License - See root LICENSE file for details.

---

**Last Updated**: January 2026  
**Documentation Version**: 1.0.0  
**Application Version**: 1.0.0
