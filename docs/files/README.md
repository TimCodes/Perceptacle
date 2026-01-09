# File-Level Documentation Index

This directory contains comprehensive documentation for every source file in the Synapse codebase.

## Documentation Structure

```
/docs/files/
├── client/              # Client application files
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── utils/           # Utility functions
│   ├── services/        # API services
│   ├── hooks/           # Custom hooks
│   └── types/           # Type definitions
└── server/              # Server application files
    ├── routes/          # API route handlers
    ├── services/        # Service layer
    ├── db/              # Database schema and connection
    └── utils/           # Server utilities
```

## Client Files

### Application Core
- [main.tsx](./client/main.md) - Application entry point
- [App.tsx](./client/App.md) - Root component with routing and providers
- [setupTests.ts](./client/setupTests.md) - Jest test configuration

### Pages
- [home.tsx](./client/pages/home.md) - Main diagram editor page
- [dashboard.tsx](./client/pages/dashboard.md) - Analytics dashboard
- [settings.tsx](./client/pages/settings.md) - Application settings
- [node-types.tsx](./client/pages/node-types.md) - Component library browser
- [not-found.tsx](./client/pages/not-found.md) - 404 error page

### Components - Diagram Canvas
- [DiagramCanvas.tsx](./client/components/DiagramCanvas/DiagramCanvas.md) - Main diagram editor
- [DiagramToolbar.tsx](./client/components/DiagramCanvas/DiagramToolbar.md) - Diagram toolbar controls
- [diagram-toolbar.tsx](./client/components/diagram-toolbar.md) - Legacy toolbar

### Components - Node Information Sidebar
- [NodeInfoSideBar.tsx](./client/components/NodeInfoSideBar/NodeInfoSideBar.md) - Node configuration panel
- [ConfigurationTab.tsx](./client/components/NodeInfoSideBar/ConfigurationTab.md) - Basic node config
- [ObservabilityTab.tsx](./client/components/NodeInfoSideBar/ObservabilityTab.md) - Metrics and logs
- [CICDTab.tsx](./client/components/NodeInfoSideBar/CICDTab.md) - GitHub workflows
- [TicketsTab.tsx](./client/components/NodeInfoSideBar/TicketsTab.md) - Issue tracking
- [TabNavigation.tsx](./client/components/NodeInfoSideBar/TabNavigation.md) - Tab switcher
- [EmptyPanel.tsx](./client/components/NodeInfoSideBar/EmptyPanel.md) - Empty state component
- [NodeLogs.tsx](./client/components/NodeInfoSideBar/NodeLogs.md) - Log viewer
- [ObservabilityMetricsDisplay.tsx](./client/components/NodeInfoSideBar/ObservabilityMetricsDisplay.md) - Metrics charts
- [GitHubIssues.tsx](./client/components/NodeInfoSideBar/GitHubIssues.md) - GitHub issues list
- [TicketCard.tsx](./client/components/NodeInfoSideBar/TicketCard.md) - Individual ticket display
- [TicketList.tsx](./client/components/NodeInfoSideBar/TicketList.md) - Ticket list view

### Components - UI Elements
- [NavBar.tsx](./client/components/NavBar/NavBar.md) - Application navigation bar
- [StatCard.tsx](./client/components/StatCard/StatCard.md) - Dashboard stat card
- [DropDown.tsx](./client/components/NodeTypeDropdown/DropDown.md) - Component selector
- [SaveMapDialog.tsx](./client/components/SaveMapDialog.md) - Save dialog modal
- [TelemetryMapsLibrary.tsx](./client/components/TelemetryMapsLibrary.md) - Map library browser
- [CustomFieldsSection.tsx](./client/components/CustomFieldsSection.md) - Custom field editor
- [theme-toggle.tsx](./client/components/theme-toggle.md) - Dark/light theme toggle

### Utilities
- [diagram-store.ts](./client/utils/diagram-store.md) ⭐ - **Global state management** (Enhanced)
- [diagram Storage.ts](./client/utils/diagramStorage.md) - LocalStorage helpers
- [queryClient.ts](./client/utils/queryClient.md) - TanStack Query configuration
- [theme-provider.tsx](./client/utils/theme-provider.md) - Theme context provider
- [theme.ts](./client/utils/theme.md) - Theme utilities
- [cn.ts](./client/utils/cn.md) - className utility
- [helpers.ts](./client/utils/helpers.md) - General helper functions
- [suggestions.ts](./client/utils/suggestions.md) - AI suggestions logic

### Cloud Components
- [cloudComponents.tsx](./client/utils/cloudComponents.md) - Cloud component registry
- [azure-components.tsx](./client/utils/azure-components.md) - Azure components
- [gcp-components.ts](./client/utils/gcp-components.md) - GCP components
- [kubernetes-components.tsx](./client/utils/kubernetes-components.md) - Kubernetes components
- [nodeConfigFields.ts](./client/utils/nodeConfigFields.md) - Node configuration schema

### Services & Data
- [telemetryMapService.ts](./client/services/telemetryMapService.md) - Map persistence API
- [mock-log-generator.ts](./client/utils/mock-log-generator.md) - Mock data generator

### Hooks
- [use-toast.ts](./client/hooks/use-toast.md) - Toast notification hook
- [use-mobile.tsx](./client/hooks/use-mobile.md) - Mobile detection hook

### Types
- [telemetryMap.ts](./client/types/telemetryMap.md) - Map type definitions

---

## Server Files

### Application Core
- [index.ts](./server/index.md) - Express server entry point
- [routes.ts](./server/routes.md) - Route registration
- [vite.ts](./server/vite.md) - Vite integration

### API Routes
- [telemetryMaps.ts](./server/routes/telemetryMaps.md) - Map CRUD endpoints
- [kubernetes.ts](./server/routes/kubernetes.md) - Kubernetes API endpoints
- [github.ts](./server/routes/github.md) - GitHub API endpoints
- [azure.ts](./server/routes/azure.md) - Azure Service Bus endpoints
- [mongodb.ts](./server/routes/mongodb.md) - MongoDB query endpoints
- [oracle.ts](./server/routes/oracle.md) - Oracle cloud endpoints
- [kafka.ts](./server/routes/kafka.md) - Kafka messaging endpoints
- [rag.ts](./server/routes/rag.md) - RAG AI query endpoints
- [agents.ts](./server/routes/agents.md) - Agent service endpoints
- [http-action.ts](./server/routes/http-action.md) - Custom HTTP request endpoints

### Services - Real Implementations
- [service-factory.ts](./server/services/service-factory.md) ⭐ - **Service factory pattern** (Enhanced)
- [index.ts](./server/services/index.md) - Service exports
- [kubernetes.ts](./server/services/kubernetes.md) - Kubernetes client service
- [github.ts](./server/services/github.md) - GitHub API service
- [azure.ts](./server/services/azure.md) - Azure Service Bus service
- [mongodb.ts](./server/services/mongodb.md) - MongoDB service
- [oracle.ts](./server/services/oracle.md) - Oracle cloud service
- [kafka.ts](./server/services/kafka.md) - Kafka messaging service
- [rag.ts](./server/services/rag.md) - RAG AI service
- [aichat.ts](./server/services/aichat.md) - AI chat service
- [agents.ts](./server/services/agents.md) - Agent orchestration service
- [http-action.ts](./server/services/http-action.md) - HTTP request service

### Services - Mock Implementations
- [kubernetes.mock.ts](./server/services/kubernetes.mock.md) - Mock Kubernetes service
- [github.mock.ts](./server/services/github.mock.md) - Mock GitHub service
- [azure.mock.ts](./server/services/azure.mock.md) - Mock Azure service
- [mongodb.mock.ts](./server/services/mongodb.mock.md) - Mock MongoDB service
- [oracle.mock.ts](./server/services/oracle.mock.md) - Mock Oracle service
- [rag.mock.ts](./server/services/rag.mock.md) - Mock RAG service
- [aichat.mock.ts](./server/services/aichat.mock.md) - Mock AI chat service

### Database
- [schema.ts](./server/db/schema.md) - Database schema definitions
- [connection.ts](./server/db/connection.md) - Database connection setup

### Utilities
- [log-formatter.ts](./server/utils/log-formatter.md) - Log formatting utilities

### Demo & Testing Files
- [demo.ts](./server/demo.md) - General demo script
- [github-demo.ts](./server/github-demo.md) - GitHub service demo
- [kubernetes-demo.ts](./server/kubernetes-demo.md) - Kubernetes service demo
- [aichat-demo.ts](./server/aichat-demo.md) - AI chat demo
- [test-azure.ts](./server/test-azure.md) - Azure service tests
- [test-mocked-services.ts](./server/test-mocked-services.md) - Mock service tests
- [verify-rag.ts](./server/verify-rag.md) - RAG service verification

### Configuration
- [drizzle.config.ts](./server/drizzle.config.md) - Drizzle ORM configuration
- [jest.config.js](./server/jest.config.md) - Jest test configuration
- [jest.setup.js](./server/jest.setup.md) - Jest test setup

### Types
- [telemetryMap.ts](./server/types/telemetryMap.md) - Map type definitions

---

## Documentation Conventions

### File Documentation Structure

Each file documentation follows this structure:

1. **Header**: File path and overview
2. **Overview**: Purpose, dependencies, exports
3. **Components/Functions**: Detailed documentation of each function
   - Signature
   - Description
   - Parameters (with types)
   - Return values
   - Side effects
   - Error cases
   - Examples
   - Called by / Calls (cross-references)
4. **Related Files**: Links to related documentation
5. **Metadata**: File stats and update date

### Enhanced Documentation (⭐)

Some critical files have been enhanced with:
- Detailed function-level analysis
- Usage examples
- Performance considerations
- Design pattern explanations
- State flow diagrams
- Best practices

Enhanced files are marked with ⭐ in this index.

---

## Quick Navigation by Concern

### State Management
- [diagram-store.ts](./client/utils/diagram-store.md) - Zustand store
- [queryClient.ts](./client/utils/queryClient.md) - Server state

### API Integration
- [telemetryMapService.ts](./client/services/telemetryMapService.md) - Client API calls
- All [routes](./server/routes/) - Server endpoints
- All [services](./server/services/) - External integrations

### UI Components
- [DiagramCanvas](./client/components/DiagramCanvas/) - Main canvas
- [NodeInfoSideBar](./client/components/NodeInfoSideBar/) - Configuration panel
- [pages](./client/pages/) - Page components

### External Services
- [kubernetes.ts](./server/services/kubernetes.md) - K8s integration
- [github.ts](./server/services/github.md) - GitHub integration
- [azure.ts](./server/services/azure.md) - Azure integration
- [rag.ts](./server/services/rag.md) - AI integration

### Database
- [schema.ts](./server/db/schema.md) - Table definitions
- [connection.ts](./server/db/connection.md) - DB connection
- [telemetryMaps.ts](./server/routes/telemetryMaps.md) - CRUD operations

---

## Contributing to Documentation

When adding new files to the codebase:

1. Add corresponding `.md` file in appropriate `docs/files/` subdirectory
2. Follow the documentation structure outlined above
3. Include cross-references to related files
4. Add entry to this index
5. Update high-level docs if architecture changes

---

## External Documentation

For higher-level documentation, see:

- [Main README](../README.md) - Project overview and navigation
- [Architecture](../architecture.md) - System design and patterns
- [Functional Overview](../functional-overview.md) - Features and workflows
- [Flow Diagrams](../flow-diagrams.md) - Sequence diagrams

---

**Total Files Documented**: 94  
**Client Files**: 48  
**Server Files**: 46  
**Enhanced Files**: 3  
**Last Updated**: January 2026
