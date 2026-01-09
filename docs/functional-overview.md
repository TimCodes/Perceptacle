# Functional Overview

## Core Features

Synapse provides a comprehensive suite of features for infrastructure visualization, monitoring, and management. The application is designed for DevOps engineers, SREs, and architects who need to map, monitor, and manage complex distributed systems.

### 1. Interactive Diagram Builder

**Capability**: Visual node-based diagram creation for infrastructure topology

**Key Functions**:
- Drag-and-drop component placement on infinite canvas
- Connect nodes with directed edges to show relationships
- Multi-select, move, and delete operations
- Zoom and pan navigation
- Undo/redo support (via ReactFlow)
- Auto-layout options for organizing diagrams

**Supported Components**:
- **Kubernetes**: Pods, Services, Deployments, StatefulSets, DaemonSets, Jobs, CronJobs, Ingress, ConfigMaps, Secrets
- **Azure**: Virtual Machines, App Services, Functions, Service Bus, Storage Accounts, SQL Database
- **GCP**: Compute Engine, Cloud Functions, Cloud Storage, BigQuery, Pub/Sub
- **Generic**: Load Balancers, Databases, Caches, APIs, Queues, Storage

**Component Features**:
- Custom labels and descriptions
- Status indicators (active, warning, error, inactive)
- Icon-based visual identification
- Configuration metadata storage
- Custom field definitions per node type

### 2. Telemetry Map Persistence

**Capability**: Save, load, and share infrastructure diagrams

**Key Functions**:
- **Save Maps**: Store diagrams with name, description, and metadata
- **Load Maps**: Retrieve previously saved diagrams
- **Map Library**: Browse all saved maps with search and filter
- **Share Maps**: Mark maps as public for team access
- **Version Control**: Track created and updated timestamps
- **Tagging**: Organize maps with custom tags

**Data Stored**:
- Map metadata (name, description, creator, timestamps)
- Node positions and configurations
- Edge connections and types
- Custom field values
- Status information

**Storage**:
- PostgreSQL database via Drizzle ORM
- Three-table schema (maps, nodes, connections)
- Cascade delete for data integrity
- UUID-based identification

### 3. Real-Time Infrastructure Monitoring

**Capability**: Live metrics and logs from connected infrastructure

#### Kubernetes Monitoring

**Features**:
- **Pod Logs**: Real-time log streaming with tail support
- **Resource Metrics**: CPU and memory usage per pod/container
- **Pod Status**: Running, pending, failed, succeeded states
- **Service Discovery**: List services and endpoints
- **Cluster Info**: Node health, version, capacity

**Use Cases**:
- Troubleshoot failed deployments
- Monitor resource consumption
- Track application logs
- Verify service connectivity

#### Azure Service Bus Monitoring

**Features**:
- **Queue Monitoring**: Message count, active messages
- **Message Operations**: Send and receive messages
- **Topic Management**: Subscription status
- **Connection Health**: Service Bus availability

**Use Cases**:
- Monitor message processing pipelines
- Debug message flow issues
- Test message producers/consumers
- Track queue depth trends

#### GitHub Integration

**Features**:
- **Pull Requests**: List PRs with status, reviews, checks
- **Workflow Runs**: CI/CD pipeline status and logs
- **Branches**: Repository branch listing
- **Issues**: Issue tracking with filters and creation

**Use Cases**:
- Monitor deployment pipelines
- Track code review status
- Link issues to infrastructure components
- Verify CI/CD health

#### Database Monitoring

**MongoDB Features**:
- Collection listing
- Query execution
- Connection statistics
- Document sampling

**Oracle Features**:
- Session monitoring
- Query execution
- Performance metrics
- Connection pool status

**Use Cases**:
- Monitor database health
- Execute diagnostic queries
- Track connection usage
- Verify data integrity

### 4. AI-Powered Assistance

**Capability**: Intelligent query and recommendation engine

#### RAG (Retrieval Augmented Generation) Service

**Features**:
- Natural language infrastructure queries
- Code analysis and explanation
- Troubleshooting suggestions
- Best practice recommendations
- Context-aware responses using diagram state

**Example Queries**:
- "Why is this pod failing?"
- "How should I connect these services?"
- "What's the best way to scale this deployment?"
- "Explain this Kubernetes error message"

**Technology**:
- OpenAI GPT models
- Custom prompt engineering
- Context injection from diagrams
- Multi-turn conversations

#### AI Chat Service

**Features**:
- Interactive diagram creation assistance
- Component selection recommendations
- Architecture pattern suggestions
- Configuration guidance

**Use Cases**:
- "Generate a microservices architecture"
- "Add monitoring to this service"
- "Suggest load balancing strategy"

### 5. Node Configuration Management

**Capability**: Detailed per-node settings and metadata

**Configuration Tabs**:

**5.1 Configuration Tab**
- Basic properties (name, description, status)
- Type-specific settings
- Custom field management
- Connection information
- Environment variables (for applicable components)

**5.2 Observability Tab**
- Live logs from pods/services
- Metrics visualization (CPU, memory, network)
- Alert history
- Performance graphs

**5.3 CI/CD Tab**
- GitHub workflow status
- Build/deployment history
- Pipeline configuration
- Run logs and artifacts

**5.4 Tickets Tab**
- Linked GitHub issues
- Issue creation workflow
- Status tracking
- Comments and updates

**Dynamic Fields**:
- Kubernetes namespace, pod selector, service name
- GitHub repository, owner, workflow ID
- Azure connection string, queue name
- MongoDB connection URI, database, collection
- Oracle connection string, query

### 6. Multi-Cloud Support

**Capability**: Unified interface for multiple cloud providers

**Supported Platforms**:
- Kubernetes (any distribution: EKS, GKE, AKS, on-prem)
- Microsoft Azure
- Google Cloud Platform
- AWS (via generic components)
- On-premises infrastructure

**Integration Approach**:
- Native SDK usage for each platform
- Consistent service interface
- Platform-specific configuration
- Credential management per service

### 7. HTTP Action Execution

**Capability**: Execute custom HTTP requests from diagram nodes

**Features**:
- GET, POST, PUT, DELETE, PATCH methods
- Custom headers and authentication
- Request body templating
- Response visualization
- Request history

**Use Cases**:
- Health check endpoints
- API testing
- Webhook triggers
- Custom integrations

### 8. Theme and Customization

**Features**:
- Light/dark theme toggle
- System theme detection
- Persistent theme preference
- Accessible color schemes
- Custom node styling

## User Flows

### Flow 1: Create Infrastructure Diagram

```
1. User opens application → Home page with blank canvas
2. Click component dropdown → Browse available component types
3. Select component (e.g., "Kubernetes Pod") → Component appears on canvas
4. Drag component to desired position → Visual feedback shows placement
5. Repeat for additional components → Build topology
6. Click source node handle → Drag to target node handle
7. Release to create connection → Edge appears between nodes
8. Click node to configure → Sidebar opens with configuration options
9. Fill in node details (name, namespace, etc.) → Configuration saved
10. Click "Save Map" button → Save dialog appears
11. Enter map name and description → Submit
12. Map saved to database → Success notification
```

**Input**: User interactions (clicks, drags, form inputs)  
**Processing**: React state updates, ReactFlow canvas management, API calls  
**Output**: Visual diagram with configured nodes and saved state

### Flow 2: Monitor Kubernetes Pod

```
1. User selects Kubernetes pod node → Node highlighted, sidebar opens
2. Navigate to "Configuration" tab → Enter namespace and pod name
3. Switch to "Observability" tab → System fetches pod logs
4. API calls Kubernetes API → Retrieves pod logs and metrics
5. Logs displayed in sidebar → Real-time log streaming
6. Metrics visualized in charts → CPU/memory graphs rendered
7. Logs auto-refresh every 30 seconds → Background polling
8. User can pause/resume logging → Polling control
9. Export logs to file → Download functionality
```

**Input**: Namespace, pod name, container name (optional)  
**Processing**: Kubernetes API authentication, log retrieval, parsing  
**Output**: Formatted logs, metrics charts, status indicators

### Flow 3: GitHub CI/CD Integration

```
1. User selects service node → Sidebar opens
2. Navigate to "CI/CD" tab → GitHub integration interface
3. Enter repository owner and name → Configuration saved
4. System fetches workflow runs → GitHub API called
5. Display workflow status → Latest runs shown with status badges
6. User clicks workflow run → Details expanded
7. View run logs and steps → Detailed execution trace
8. Check pull request status → Linked PRs displayed
9. Click PR number → Opens GitHub in new tab
```

**Input**: GitHub repository owner, repo name, optional workflow ID  
**Processing**: GitHub API authentication, workflow data retrieval, status mapping  
**Output**: Workflow run history, status indicators, links to GitHub

### Flow 4: AI-Assisted Troubleshooting

```
1. User encounters error in logs → Error message visible
2. Click "Ask AI" button → AI chat interface opens
3. User types question: "Why is this pod crashing?" → Natural language input
4. System sends query to RAG service → Context includes pod config and logs
5. RAG service processes query → OpenAI API called with context
6. AI generates response → Explanation and suggestions returned
7. Response displayed in chat → Formatted markdown with code blocks
8. User asks follow-up question → Multi-turn conversation
9. AI provides configuration fix → YAML snippet suggested
10. User applies fix to configuration → Node config updated
```

**Input**: Natural language question, diagram context, node logs  
**Processing**: Context extraction, prompt engineering, OpenAI API call, response formatting  
**Output**: Troubleshooting explanation, configuration suggestions, best practices

### Flow 5: Save and Share Map

```
1. User completes diagram → Canvas has nodes and edges
2. Click "Save" in toolbar → Save dialog opens
3. Enter map details:
   - Name: "Production Infrastructure"
   - Description: "Main services topology"
   - Tags: ["production", "kubernetes"]
   - Public: true (checkbox)
4. Click "Save" button → Validation runs
5. System transforms ReactFlow data → Convert to database schema
6. API POST to /api/telemetry-maps → Server receives request
7. Create telemetry map record → Database INSERT
8. Create node records for each node → Batch INSERT
9. Create connection records for edges → Batch INSERT
10. Transaction commits → Success response
11. Success notification → "Map saved successfully"
12. Map appears in library → Available to all users (public)
```

**Input**: Map name, description, tags, public flag, nodes, edges  
**Processing**: Data transformation, validation, database transactions  
**Output**: Saved map with UUID, success confirmation, library entry

### Flow 6: Load Existing Map

```
1. User clicks "Load Map" button → Map library opens
2. System fetches saved maps → GET /api/telemetry-maps
3. Display maps in grid/list → Thumbnail, name, description shown
4. User filters by tag → Client-side filtering
5. User searches by name → Client-side search
6. Click map to preview → Show map details
7. Click "Load" button → Confirm dialog appears
8. Confirm load → Fetch full map data
9. API GET /api/telemetry-maps/:id → Include nodes and connections
10. Transform database format to ReactFlow → Convert schema
11. Clear current canvas → Reset diagram state
12. Load nodes and edges → ReactFlow state updated
13. Canvas renders loaded diagram → Visual display
14. Library closes → Return to main canvas
```

**Input**: Map selection from library  
**Processing**: Database query with joins, data transformation, state updates  
**Output**: Loaded diagram on canvas, all node configurations restored

## Responsibilities of Major Modules

### Client Modules

#### `packages/client/src/App.tsx`
**Responsibility**: Application root and routing setup  
**Key Functions**: Theme provider initialization, query client setup, navigation bar rendering, route definition  
**Dependencies**: Wouter, TanStack Query, Theme Provider, Navbar

#### `packages/client/src/pages/home.tsx`
**Responsibility**: Main diagram editor page  
**Key Functions**: Canvas management, sidebar toggle, toolbar integration, save/load trigger handling  
**Dependencies**: DiagramCanvas, NodeInfoSideBar, DiagramToolbar, ReactFlow

#### `packages/client/src/components/DiagramCanvas/DiagramCanvas.tsx`
**Responsibility**: Core diagram rendering and interaction  
**Key Functions**: Node/edge state management, drag-and-drop, connection creation, ReactFlow event handling  
**Dependencies**: ReactFlow, diagram-store, SaveMapDialog, TelemetryMapsLibrary

#### `packages/client/src/components/NodeInfoSideBar/NodeInfoSideBar.tsx`
**Responsibility**: Node configuration and monitoring interface  
**Key Functions**: Tab navigation, configuration display, observability data fetching, CI/CD status  
**Dependencies**: ConfigurationTab, ObservabilityTab, CICDTab, TicketsTab, diagram-store

#### `packages/client/src/utils/diagram-store.ts`
**Responsibility**: Global diagram state management  
**Key Functions**: Node/edge storage, selection tracking, ReactFlow instance management, diagram persistence  
**Dependencies**: Zustand, ReactFlow types

#### `packages/client/src/services/telemetryMapService.ts`
**Responsibility**: API communication for map operations  
**Key Functions**: Save map, load maps, delete map, list maps  
**Dependencies**: Fetch API, TelemetryMap types

### Server Modules

#### `packages/server/index.ts`
**Responsibility**: Express server initialization and startup  
**Key Functions**: Middleware setup, CORS configuration, route registration, error handling, server startup  
**Dependencies**: Express, routes.ts, dotenv

#### `packages/server/routes.ts`
**Responsibility**: API route organization and registration  
**Key Functions**: Mount route handlers on appropriate paths  
**Dependencies**: All route modules (azure, kubernetes, github, etc.)

#### `packages/server/routes/github.ts`
**Responsibility**: GitHub API endpoint handlers  
**Key Functions**: List PRs, get workflow runs, list branches, manage issues  
**Dependencies**: github service, Express

#### `packages/server/routes/kubernetes.ts`
**Responsibility**: Kubernetes API endpoint handlers  
**Key Functions**: List pods, get logs, fetch metrics, list services, cluster info  
**Dependencies**: kubernetes service, Express

#### `packages/server/routes/telemetryMaps.ts`
**Responsibility**: Map persistence API handlers  
**Key Functions**: Create map, list maps, get map by ID, update map, delete map  
**Dependencies**: Drizzle ORM, database schema, Express

#### `packages/server/services/github.ts`
**Responsibility**: GitHub API integration logic  
**Key Functions**: Initialize Octokit, fetch pull requests, get workflow runs, manage issues  
**Dependencies**: @octokit/rest, GitHub types

#### `packages/server/services/kubernetes.ts`
**Responsibility**: Kubernetes cluster interaction logic  
**Key Functions**: Initialize k8s client, list resources, stream logs, get metrics  
**Dependencies**: @kubernetes/client-node, Kubernetes types

#### `packages/server/services/rag.ts`
**Responsibility**: AI query processing with context  
**Key Functions**: Process natural language queries, inject diagram context, call OpenAI API  
**Dependencies**: openai SDK, context builders

#### `packages/server/services/service-factory.ts`
**Responsibility**: Centralized service instantiation  
**Key Functions**: Create service singletons, manage lifecycle, provide mock services  
**Dependencies**: All service classes

#### `packages/server/db/schema.ts`
**Responsibility**: Database schema definition  
**Key Functions**: Define tables, relationships, types, indexes  
**Dependencies**: Drizzle ORM, PostgreSQL

#### `packages/server/db/connection.ts`
**Responsibility**: Database connection management  
**Key Functions**: Create connection pool, export database instance  
**Dependencies**: Drizzle ORM, node-postgres

## Assumptions and Constraints

### Assumptions

1. **Network Connectivity**: Application assumes reliable network access to external services (GitHub, Kubernetes clusters, Azure, etc.)

2. **Authentication Pre-Configured**: Users have already obtained and configured necessary API tokens and credentials in environment variables

3. **Single User per Instance**: Current implementation does not include multi-user authentication; designed for team/internal use

4. **Modern Browser**: Client assumes modern browser with ES6+ support, WebSocket support, and localStorage

5. **English Language**: UI text and documentation in English only

6. **Kubernetes Access**: For Kubernetes integration, assumes kubeconfig file is properly configured or in-cluster service account is available

7. **Database Availability**: PostgreSQL database is always available and properly initialized with schema

8. **Resource Limits**: External APIs (GitHub, OpenAI) have rate limits that are respected by the application

9. **Data Volume**: Diagram node count is reasonable (< 500 nodes per diagram) for performance

10. **Trust Boundary**: All users have trusted access; no malicious input expected

### Constraints

#### Technical Constraints

1. **GitHub API Rate Limits**:
   - 5,000 requests/hour for authenticated users
   - Lower limits for search API
   - Must implement caching and batching strategies

2. **OpenAI API Costs**:
   - Token-based pricing model
   - Rate limits per account tier
   - Context window size limits (e.g., 128K tokens for GPT-4)

3. **Kubernetes API Performance**:
   - Log streaming can be resource-intensive
   - Metrics collection may have cluster impact
   - Watch operations maintain long-lived connections

4. **Browser Storage Limits**:
   - localStorage limited to ~5-10MB
   - Not suitable for large diagrams
   - Server-side persistence required

5. **Database Schema**:
   - JSONB fields for node config have query limitations
   - No full-text search on descriptions (could add)
   - PostgreSQL connection pool size limits concurrent requests

6. **WebSocket Connection Limits**:
   - Server can maintain limited WebSocket connections
   - Load balancer may require sticky sessions
   - Reconnection logic needed for reliability

#### Functional Constraints

1. **No Real-Time Collaboration**:
   - Multiple users cannot edit same diagram simultaneously
   - Last write wins on concurrent saves
   - No operational transformation for conflicts

2. **Limited Undo/Redo**:
   - Only ReactFlow built-in undo for canvas operations
   - No undo for configuration changes
   - No change history tracking

3. **No Diagram Versioning**:
   - Single current version per map
   - No version history or diff
   - No rollback capability

4. **Fixed Node Types**:
   - Predefined set of component types
   - Cannot add custom node types without code changes
   - Limited extensibility for new integrations

5. **Polling-Based Updates**:
   - Real-time metrics use polling (30-60s intervals)
   - Not true push-based updates
   - May have slight data staleness

6. **Single Cluster per Node**:
   - Each Kubernetes node connects to one cluster
   - Cannot aggregate multi-cluster data
   - Requires separate nodes for each cluster

#### Operational Constraints

1. **Credential Management**:
   - All credentials in environment variables
   - No secrets management integration
   - Rotation requires server restart

2. **Scalability Limits**:
   - Single PostgreSQL instance
   - No read replicas
   - Limited to vertical scaling

3. **Monitoring and Observability**:
   - Basic logging only
   - No metrics export (Prometheus, etc.)
   - No distributed tracing
   - No application performance monitoring (APM)

4. **Backup and Recovery**:
   - No automated backup system
   - Manual database dumps required
   - No disaster recovery automation

5. **Deployment**:
   - Docker-based deployment
   - No CI/CD pipeline included
   - Manual configuration required
   - No infrastructure-as-code templates

## Non-Functional Requirements

### Performance

**Response Time**:
- API endpoints: < 500ms for simple queries (p95)
- Diagram rendering: < 100ms for initial paint
- Node selection: < 50ms visual feedback
- Log streaming: < 2s initial load, < 1s updates

**Throughput**:
- Support 100 concurrent API requests
- Handle 50 simultaneous WebSocket connections
- Render diagrams up to 500 nodes without lag

**Resource Usage**:
- Client bundle size: < 2MB (gzipped)
- Server memory: < 512MB under normal load
- Database connections: < 20 concurrent

### Reliability

**Availability**: 
- Target 99% uptime for internal use
- Graceful degradation when external services unavailable
- Error boundaries prevent full application crashes

**Error Handling**:
- All API errors return appropriate HTTP status codes
- User-friendly error messages displayed
- Retry logic for transient failures (network, API rate limits)

**Data Integrity**:
- Database transactions for multi-table operations
- Foreign key constraints prevent orphaned records
- Cascade delete maintains referential integrity

### Usability

**Learning Curve**:
- New users productive within 30 minutes
- Intuitive drag-and-drop interface
- Clear visual feedback for all actions
- Tooltips and help text for complex features

**Accessibility**:
- Keyboard navigation support
- ARIA labels on interactive elements
- Color contrast meets WCAG AA standards
- Screen reader compatible (basic)

**Responsiveness**:
- Optimized for desktop (1920x1080+)
- Functional on tablet (1024x768+)
- Not optimized for mobile

### Maintainability

**Code Quality**:
- TypeScript for type safety
- ESLint and Prettier for code style
- Comprehensive JSDoc comments
- Modular architecture with clear boundaries

**Testing**:
- Unit tests for business logic
- Integration tests for API endpoints
- Component tests for React UI
- Mock services for external dependencies

**Documentation**:
- Comprehensive architecture documentation
- Per-file function documentation
- API endpoint documentation
- Setup and deployment guides

### Security

**Authentication**:
- API token-based for external services
- Environment variable credential storage
- No plaintext passwords

**Authorization**:
- Public/private map visibility
- Creator-based access control (basic)
- Service-level permissions via tokens

**Data Protection**:
- HTTPS in production (external reverse proxy)
- Parameterized queries prevent SQL injection
- XSS protection via React
- CORS restricts cross-origin requests

**Audit**:
- Request logging
- Error logging
- Created/updated timestamps on maps
- Creator tracking

### Portability

**Platform Support**:
- Runs on Linux, macOS, Windows (via Docker)
- Node.js 18+ required
- PostgreSQL 14+ required
- Modern browsers (Chrome, Firefox, Safari, Edge)

**Deployment Options**:
- Docker Compose (development)
- Docker (production)
- Kubernetes (possible with manifests)
- Cloud platforms (AWS, Azure, GCP)

**Configuration**:
- Environment variable-based
- No hard-coded values
- Example configuration provided
- Validation on startup

---

**Document Version**: 1.0.0  
**Last Updated**: January 2026  
**Related Documents**: [Architecture](./architecture.md), [Flow Diagrams](./flow-diagrams.md)
