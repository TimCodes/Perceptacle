# Perceptacle Feature Breakdown

## 🎯 Executive Summary

Perceptacle is a hybrid observability, data visualization, and troubleshooting platform designed to assist on-call engineers. While the project has a solid foundation with a React-based diagramming UI and initial Node.js backend integrations for Azure, Kubernetes, and GitHub, it currently lacks the core "intelligent" features that differentiate it. Specifically, the AI agentic capabilities, comprehensive data ingestion, and active remediation are missing or incomplete.

### Critical Gaps:
- 🚧 **Agentic Capabilities**: Python/LangGraph agents package created, needs agent implementation.
- ✅ **RAG Integration**: Application is now connected to the external RAG service with mock support.
- ❌ **Incomplete Data Connections**: Oracle service is a skeleton.
- ❌ **No Action/Reposting**: Cannot send messages to Kafka/Service Bus/HTTP.
- ❌ **No Dashboard View**: UI is limited to diagram editor.

---

## 📋 Feature Breakdown by Priority

---

## 🔴 **PRIORITY 1: CRITICAL PATH TO MVP (The "Brain" & Data)**

### Epic 1: AI Agents & RAG Architecture
**Business Value**: HIGH | **Technical Complexity**: HIGH | **Estimated Effort**: 2 weeks

#### User Stories:

**1.1 Python Agents Package Setup**
- **Story Points**: 5
- **Description**: As a developer, I need a Python-based microservice/package to host LangGraph agents, as the current Node.js backend is insufficient for advanced agentic workflows.
- **Status**: ✅ **DONE**
- **Acceptance Criteria**:
  - [x] Create `packages/agents` (Python/FastAPI or Flask).
  - [x] Configure Docker container for the Python service.
  - [x] Establish communication between Node.js server and Python agents service.

**1.2 RAG Service Integration (External)**
- **Story Points**: 5
- **Description**: As an engineer, I need the system to connect to our existing external RAG service via REST so the AI can answer context-aware questions using documentation and historical logs.
- **Status**: ✅ **DONE**
- **Acceptance Criteria**:
  - [x] Implement `RagService` in `packages/server` to consume the external REST API.
  - [x] Add configuration for RAG service URL and Authentication.
  - [x] Create retrieval tools/functions for the AI Assistant to query the RAG service.

**1.3 LangGraph Agent Implementation**
- **Story Points**: 13
- **Description**: As a user, I need an autonomous agent that can plan and execute troubleshooting steps, not just answer chat questions.
- **Status**: ✅ **DONE**
- **Acceptance Criteria**:
  - [x] Implement a Supervisor Agent using LangGraph.
  - [x] Create tools for the agent (Query Logs, Check Metrics, Search Docs via RAG).
  - [x] Integrate agent with the Chat UI.

### Epic 2: Data Connectors & Ingestion
**Business Value**: HIGH | **Technical Complexity**: MEDIUM | **Estimated Effort**: 2 weeks

#### User Stories:

**2.1 Oracle Cloud Integration (Real Implementation)**
- **Story Points**: 8
- **Description**: As an engineer, I need to visualize and monitor Oracle Cloud resources.
- **Status**: ⬜ **TODO** (Skeleton exists, implementation missing)
- **Acceptance Criteria**:
  - [ ] Implement `OracleService` using OCI SDK.
  - [ ] Fetch Compute Instances, VCNs, and Databases.
  - [ ] Add unit and integration tests.

**2.2 MongoDB Integration**
- **Story Points**: 5
- **Description**: As an engineer, I need to connect to MongoDB to view database health and logs.
- **Status**: ✅ **DONE**
- **Acceptance Criteria**:
  - [x] Create `MongoService` in `packages/server`.
  - [x] Implement connection health check.
  - [x] Fetch collection stats and slow query logs.

**2.3 Log Ingestion Pipeline**
- **Story Points**: 8
- **Description**: As an engineer, I need Kubernetes and Azure logs to be ingested/forwarded to the RAG system or available for analysis.
- **Status**: ✅ **DONE**
- **Acceptance Criteria**:
  - [x] Update `KubernetesService` to stream/fetch pod logs.
  - [x] Update `AzureService` to fetch Monitor logs.
  - [x] Ensure logs are formatted and available for the Agent/RAG context.

---

## 🟠 **PRIORITY 2: CORE FUNCTIONALITY (Actions & Views)**

### Epic 3: Remediation & Message Reposting
**Business Value**: MEDIUM | **Technical Complexity**: MEDIUM | **Estimated Effort**: 1.5 weeks

#### User Stories:

**3.1 Kafka Producer & Reposting**
- **Story Points**: 5
- **Description**: As an engineer, I need to repost failed messages to Kafka topics to fix data pipeline issues.
- **Status**: ✅ **DONE**
- **Acceptance Criteria**:
  - [x] Implement `KafkaService` producer in backend.
  - [x] Add UI action to "Repost Message" on a Kafka node.

**3.2 Azure Service Bus Sender**
- **Story Points**: 5
- **Description**: As an engineer, I need to send messages to Azure Service Bus queues/topics.
- **Status**: ⬜ **TODO**
- **Acceptance Criteria**:
  - [ ] Implement send capability in `AzureService`.
  - [ ] Add UI action for Service Bus nodes.

**3.3 HTTP Webhook/Action Sender**
- **Story Points**: 3
- **Description**: As an engineer, I need to trigger external webhooks (e.g., PagerDuty ack, Jenkins job) from the UI.
- **Status**: ⬜ **TODO**
- **Acceptance Criteria**:
  - [ ] Create generic HTTP action handler.
  - [ ] Allow users to define custom HTTP actions on nodes.

### Epic 4: Dashboard & Visualization
**Business Value**: MEDIUM | **Technical Complexity**: MEDIUM | **Estimated Effort**: 1 week

#### User Stories:

**4.1 Standard Dashboard View**
- **Story Points**: 8
- **Description**: As a user, I want a traditional dashboard view (charts, tables) alongside the diagram view for better metric visibility.
- **Status**: ⬜ **TODO**
- **Acceptance Criteria**:
  - [ ] Create a new "Dashboard" route/page in the Client.
  - [ ] Implement widgets for CPU/Memory metrics (using Recharts).
  - [ ] Implement a Log Viewer widget.

---

## 🟢 **PRIORITY 3: ENHANCED EXPERIENCE**

### Epic 5: UI Polish & Advanced Features
**Business Value**: LOW | **Technical Complexity**: LOW | **Estimated Effort**: 1 week

#### User Stories:

**5.1 Advanced Chat Interface**
- **Story Points**: 3
- **Description**: As a user, I want a richer chat experience with history, code highlighting, and streaming responses.
- **Status**: 🚧 **IN PROGRESS** (Basic chat exists)
- **Acceptance Criteria**:
  - [ ] Implement streaming responses from the Python agent.
  - [ ] Persist chat history per session.
  - [ ] Add syntax highlighting for code blocks in chat.

**5.2 Visual Refinements**
- **Story Points**: 3
- **Description**: As a user, I want the diagram nodes to visually reflect their health state (e.g., turning red on error).
- **Status**: ⬜ **TODO**
- **Acceptance Criteria**:
  - [ ] Bind node colors/borders to real-time health metrics.
  - [ ] Add animations for active data flow.
