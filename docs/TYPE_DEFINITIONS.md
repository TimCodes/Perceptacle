# Perceptacle Type Definitions

A comprehensive reference of all TypeScript interfaces and types used in the Perceptacle infrastructure visualization and monitoring application.

> **Note**: This branch (`copilot/frontend-mock-server-setup`) is configured for mock services with Azure and Kubernetes support only. However, this documentation covers all type definitions for completeness and reference.

---

## Table of Contents

1. [Core Node Type System](#core-node-type-system)
2. [Telemetry Map Types](#telemetry-map-types)
3. [Chat Types](#chat-types)
4. [Azure Service Types](#azure-service-types)
5. [Kubernetes Service Types](#kubernetes-service-types)
6. [GitHub Service Types](#github-service-types)
7. [MongoDB Service Types](#mongodb-service-types)
8. [Oracle Cloud Types](#oracle-cloud-types)
9. [RAG Service Types](#rag-service-types)
10. [AI Chat Service Types](#ai-chat-service-types)
11. [HTTP Action Types](#http-action-types)

---

## Core Node Type System

Types for defining infrastructure nodes across multiple cloud providers.

```typescript
interface NodeTypeDefinition {
  type: string;           // Primary category: 'azure' | 'kubernetes' | 'kafka' | 'gcp' | 'generic'
  subtype: string;        // Specific resource type
  variant?: string;       // Optional variant (e.g., 'queue' vs 'topic' for service-bus)
}

type MessageProtocol = 'http' | 'https' | 'kafka' | 'service-bus' | 'grpc' | 'websocket';

interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'toggle' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  description?: string;
  defaultValue?: any;
  validation?: (value: any) => boolean | string;
}

interface NodeCapabilities {
  hasMetrics?: boolean;
  hasLogs?: boolean;
  hasMessages?: boolean;
  messageProtocol?: MessageProtocol;
  hasHealthCheck?: boolean;
  hasAutoScaling?: boolean;
  hasNetworkConfig?: boolean;
}

interface ResourceMapping {
  provider: string;              // e.g., 'Microsoft.Web/sites'
  buildId?: (data: any) => string;
  apiVersion?: string;
}

interface RegisteredNodeType {
  type: string;
  subtype: string;
  variant?: string;
  displayName: string;
  icon?: any;
  category: string;
  fields?: ConfigField[];
  capabilities: NodeCapabilities;
  resourceMapping?: ResourceMapping;
  description?: string;
  tags?: string[];
}

type NodeTypeRegistry = RegisteredNodeType[];
```

---

## Telemetry Map Types

Types for infrastructure diagrams and their components.

```typescript
interface TelemetryMap {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
  metadata: Record<string, any>;
  nodes: TelemetryMapNode[];
  connections: TelemetryMapConnection[];
}

interface TelemetryMapNode {
  id: string;
  mapId: string;
  nodeId: string;
  nodeType: string | NodeTypeDefinition;
  label: string;
  status: 'active' | 'warning' | 'error' | 'inactive';
  description?: string;
  positionX: number;
  positionY: number;
  config: Record<string, any>;
  createdAt: string;
}

interface TelemetryMapConnection {
  id: string;
  mapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: string;
  createdAt: string;
}

interface CreateTelemetryMapRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  nodes: Omit<TelemetryMapNode, 'id' | 'mapId' | 'createdAt'>[];
  connections: Omit<TelemetryMapConnection, 'id' | 'mapId' | 'createdAt'>[];
}

interface UpdateTelemetryMapRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  nodes?: Omit<TelemetryMapNode, 'id' | 'mapId' | 'createdAt'>[];
  connections?: Omit<TelemetryMapConnection, 'id' | 'mapId' | 'createdAt'>[];
}

interface TelemetryMapListResponse {
  maps: TelemetryMap[];
  total: number;
}

interface ReactFlowNodeData {
  label: string;
  status: 'active' | 'warning' | 'error' | 'inactive';
  description?: string;
  config?: Record<string, any>;
  type?: string | NodeTypeDefinition;
}

interface ReactFlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: ReactFlowNodeData;
}

interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

interface DiagramExportData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

interface SaveMapDialogData {
  name: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
}
```

---

## Chat Types

Types for chat sessions and messages.

```typescript
interface ChatSession {
  id: string;
  userId?: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

interface ChatReference {
  id: string;
  title: string;
  url?: string;
}

interface SendMessageResponse {
  response: string;
  session_id: string;
  metadata?: any;
  references?: ChatReference[];
}
```

---

## Azure Service Types

Types for Azure resource management and monitoring.

### Credentials and Configuration

```typescript
interface AzureCredentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}
```

### Query Parameters

```typescript
interface ResourceQueryParams {
  resourceGroup?: string;
  location?: string;
  resourceType?: string;
  tagName?: string;
  tagValue?: string;
}

interface MetricQueryParams {
  resourceId: string;
  timespan?: string;
  interval?: string;
  metricNames?: string[];
  aggregation?: string;
}

interface LogQueryParams {
  resourceId: string;
  query: string;
  timespan?: string;
  workspaceId?: string;
}
```

### Resource Information

```typescript
interface ResourceGroup {
  id: string;
  name: string;
  location: string;
  tags?: Record<string, string>;
  properties?: { provisioningState: string };
}

interface Resource {
  id: string;
  name: string;
  type: string;
  location: string;
  resourceGroup: string;
  tags?: Record<string, string>;
  properties?: Record<string, any>;
}

interface SubscriptionInfo {
  id: string;
  name: string;
  state: string;
}

interface ResourceGroupInfo {
  name: string;
  location: string;
  id: string;
}

interface LocationInfo {
  name: string;
  displayName: string;
}

interface AppServiceInfo {
  name: string;
  resourceGroup: string;
  location: string;
  state: string;
}

interface FunctionAppInfo {
  name: string;
  resourceGroup: string;
  location: string;
  runtime: string;
}

interface StorageAccountInfo {
  name: string;
  resourceGroup: string;
  location: string;
  tier: string;
}

interface CosmosDbInfo {
  name: string;
  resourceGroup: string;
  location: string;
  kind: string;
}

interface KeyVaultInfo {
  name: string;
  resourceGroup: string;
  location: string;
}

interface VNetInfo {
  name: string;
  resourceGroup: string;
  location: string;
  addressSpace: string[];
}
```

### Metrics and Logs

```typescript
interface ResourceMetric {
  name: string;
  value: string;
  timestamp: Date;
  dimensions: Record<string, any>;
  unit?: string;
}

interface ResourceLog {
  timestamp: Date;
  message: string;
  level: string;
  properties: Record<string, any>;
}

interface MetricDataPoint {
  timeStamp: string;
  average?: number;
  minimum?: number;
  maximum?: number;
}

interface Metric {
  id: string;
  name: { value: string; localizedValue: string };
  type: string;
  unit: 'Percent' | 'Bytes' | 'BytesPerSecond' | 'CountPerSecond' | 'Count';
  timeseries: Array<{ data: MetricDataPoint[] }>;
}

interface MetricsResponse {
  cost: number;
  timespan: string;
  interval: string;
  namespace: string;
  resourceregion: string;
  value: Metric[];
}

interface LogEntry {
  TimeGenerated: string;
  ResourceId: string;
  Level: 'Information' | 'Warning' | 'Error' | 'Debug';
  Category: string;
  Message: string;
  CorrelationId: string;
  OperationName: string;
  ResultType: 'Success' | 'Failed';
}

interface LogsResponse {
  tables: Array<{
    name: string;
    columns: Array<{ name: string; type: string }>;
    rows: any[][];
  }>;
  logs: LogEntry[];
}
```

### Service Bus

```typescript
interface ServiceBusNamespaceInfo {
  name: string;
  resourceGroup: string;
  location: string;
  sku: string;
}

interface ServiceBusQueueInfo {
  name: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferMessageCount: number;
  transferDeadLetterMessageCount: number;
  totalMessageCount: number;
  status: string;
  sizeInBytes: number;
  maxSizeInMegabytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceBusTopicInfo {
  name: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferMessageCount: number;
  transferDeadLetterMessageCount: number;
  totalMessageCount: number;
  status: string;
  sizeInBytes: number;
  maxSizeInMegabytes: number;
  subscriptionCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceBusSubscriptionInfo {
  name: string;
  topicName: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferMessageCount: number;
  transferDeadLetterMessageCount: number;
  totalMessageCount: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ServiceBusNamespaceSummary {
  namespaceName: string;
  totalQueues: number;
  totalTopics: number;
  totalSubscriptions: number;
  totalActiveMessages: number;
  totalDeadLetterMessages: number;
  totalScheduledMessages: number;
  queues: ServiceBusQueueInfo[];
  topics: ServiceBusTopicInfo[];
  subscriptions: ServiceBusSubscriptionInfo[];
}
```

### Azure Options (Client API)

```typescript
interface AzureOptions {
  resourceGroups: { name: string; location: string }[];
  locations: string[];
  appServices: { name: string; resourceGroup: string }[];
  functionApps: { name: string; resourceGroup: string }[];
  serviceBusNamespaces: { name: string; resourceGroup: string }[];
  queues: string[];
  topics: string[];
  storageAccounts: { name: string; resourceGroup: string }[];
  cosmosDbAccounts: { name: string; resourceGroup: string }[];
  keyVaults: { name: string; resourceGroup: string }[];
  virtualNetworks: { name: string; resourceGroup: string }[];
}
```

### Health and Errors

```typescript
interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version: string;
}

interface ApiError {
  error: { code: string; message: string };
}

interface ServiceType {
  type: string;
  count: number;
}
```

---

## Kubernetes Service Types

Types for Kubernetes cluster management.

### Configuration

```typescript
interface KubernetesConfig {
  kubeconfigPath?: string;
  kubeconfigContent?: string;
  context?: string;
}
```

### Pod Types

```typescript
interface PodLogParams {
  namespace: string;
  podName: string;
  containerName?: string;
  follow?: boolean;
  tailLines?: number;
  sinceSeconds?: number;
}

interface PodMetrics {
  podName: string;
  namespace: string;
  timestamp: Date;
  containers: Array<{
    name: string;
    cpu: string;
    memory: string;
    cpuUsageNanoCores: number;
    memoryUsageBytes: number;
  }>;
}

interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  age: string;
  ip: string;
  node: string;
  containers: Array<{
    name: string;
    image: string;
    ready: boolean;
    restartCount: number;
    state: string;
  }>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
}
```

### Service and Deployment Types

```typescript
interface ServiceInfo {
  name: string;
  namespace: string;
  type: string;
  clusterIP: string;
  externalIPs: string[];
  ports: Array<{
    name?: string;
    port: number;
    targetPort: number | string;
    protocol: string;
  }>;
  selector: Record<string, string>;
  endpoints: Array<{ ip: string; ready: boolean }>;
}

interface DeploymentInfo {
  name: string;
  namespace: string;
  replicas: number;
  readyReplicas: number;
  availableReplicas: number;
  updatedReplicas: number;
  strategy: string;
  age: string;
  labels: Record<string, string>;
  selector: Record<string, string>;
}
```

### Cluster Information

```typescript
interface ClusterInfo {
  version: string;
  nodes: Array<{
    name: string;
    status: string;
    roles: string[];
    age: string;
    version: string;
    internalIP: string;
    os: string;
    kernelVersion: string;
    containerRuntime: string;
    capacity: {
      cpu: string;
      memory: string;
      pods: string;
      storage: string;
    };
    allocatable: {
      cpu: string;
      memory: string;
      pods: string;
      storage: string;
    };
    conditions: Array<{
      type: string;
      status: string;
      lastTransitionTime: Date;
    }>;
  }>;
  namespaces: string[];
  totalPods: number;
  totalServices: number;
  totalDeployments: number;
}

interface NamespaceResourceUsage {
  namespace: string;
  pods: number;
  services: number;
  deployments: number;
  configMaps: number;
  secrets: number;
  persistentVolumeClaims: number;
}
```

### Kubernetes Options (Client API)

```typescript
interface KubernetesOptions {
  namespaces: string[];
  pods: { name: string; namespace: string }[];
  services: { name: string; namespace: string }[];
  deployments: { name: string; namespace: string }[];
}
```

---

## GitHub Service Types

Types for GitHub integration and CI/CD.

### Credentials and Parameters

```typescript
interface GitHubCredentials {
  token: string;
}

interface PullRequestParams {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  sort?: 'created' | 'updated' | 'popularity' | 'long-running';
  direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

interface WorkflowRunParams {
  owner: string;
  repo: string;
  workflow_id?: string | number;
  status?: 'queued' | 'in_progress' | 'completed';
  per_page?: number;
  page?: number;
}

interface BranchParams {
  owner: string;
  repo: string;
  protected?: boolean;
  per_page?: number;
  page?: number;
}

interface IssueParams {
  owner: string;
  repo: string;
  state?: 'open' | 'closed' | 'all';
  labels?: string;
  sort?: 'created' | 'updated' | 'comments';
  direction?: 'asc' | 'desc';
  since?: string;
  per_page?: number;
  page?: number;
}

interface CreateIssueParams {
  owner: string;
  repo: string;
  title: string;
  body?: string;
  assignees?: string[];
  milestone?: number;
  labels?: string[];
}
```

### Resource Types

```typescript
interface PullRequest {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: { login: string; avatar_url: string };
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  head: { ref: string; sha: string };
  base: { ref: string; sha: string };
  html_url: string;
  draft: boolean;
  mergeable: boolean | null;
  mergeable_state: string;
  merged: boolean;
  comments: number;
  review_comments: number;
  commits: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

interface WorkflowRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  status: string;
  conclusion: string | null;
  workflow_id: number;
  url: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  event: string;
  run_number: number;
  run_attempt: number;
}

interface Branch {
  name: string;
  commit: { sha: string; url: string };
  protected: boolean;
  protection?: {
    enabled: boolean;
    required_status_checks?: {
      enforcement_level: string;
      contexts: string[];
    };
  };
}

interface Issue {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  user: { login: string; avatar_url: string };
  labels: Array<{
    id: number;
    name: string;
    color: string;
    description: string | null;
  }>;
  assignees: Array<{ login: string; avatar_url: string }>;
  milestone: {
    id: number;
    number: number;
    title: string;
  } | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
}
```

---

## MongoDB Service Types

Types for MongoDB database operations.

```typescript
interface MongoDBCredentials {
  connectionString: string;
  databaseName: string;
}

interface MongoDBConfig {
  credentials?: MongoDBCredentials;
  connectionString?: string;
  databaseName?: string;
}

interface QueryParams {
  filter?: Record<string, any>;
  options?: Record<string, any>;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

interface InsertResult {
  acknowledged: boolean;
  insertedId: string;
}

interface UpdateResult {
  acknowledged: boolean;
  matchedCount: number;
  modifiedCount: number;
  upsertedCount: number;
  upsertedId?: string;
}

interface DeleteResult {
  acknowledged: boolean;
  deletedCount: number;
}

interface DatabaseInfo {
  name: string;
  sizeOnDisk: number;
  empty: boolean;
}

interface CollectionInfo {
  name: string;
  type: string;
  options: Record<string, any>;
  info: { readOnly: boolean };
}
```

---

## Oracle Cloud Types

Types for Oracle Cloud Infrastructure (OCI) management.

### Credentials and Parameters

```typescript
interface OracleCredentials {
  tenancy: string;
  user: string;
  fingerprint: string;
  privateKey: string;
  region: string;
}

interface ComputeInstanceParams {
  compartmentId: string;
  availabilityDomain?: string;
  displayName?: string;
  state?: 'RUNNING' | 'STOPPED' | 'TERMINATED' | 'PROVISIONING';
  limit?: number;
  page?: string;
}

interface VolumeParams {
  compartmentId: string;
  availabilityDomain?: string;
  displayName?: string;
  state?: 'AVAILABLE' | 'PROVISIONING' | 'RESTORING' | 'TERMINATING' | 'TERMINATED';
  limit?: number;
  page?: string;
}

interface VcnParams {
  compartmentId: string;
  displayName?: string;
  state?: 'AVAILABLE' | 'PROVISIONING' | 'TERMINATING' | 'TERMINATED';
  limit?: number;
  page?: string;
}

interface DatabaseParams {
  compartmentId: string;
  displayName?: string;
  state?: 'AVAILABLE' | 'PROVISIONING' | 'TERMINATING' | 'TERMINATED' | 'STOPPED';
  limit?: number;
  page?: string;
}

interface MetricParams {
  compartmentId: string;
  namespace: string;
  query: string;
  startTime?: Date;
  endTime?: Date;
  resolution?: string;
}
```

### Resource Types

```typescript
interface ComputeInstance {
  id: string;
  displayName: string;
  compartmentId: string;
  availabilityDomain: string;
  lifecycleState: string;
  shape: string;
  imageId: string;
  timeCreated: string;
  region: string;
  faultDomain?: string;
  metadata: Record<string, any>;
  publicIp?: string;
  privateIp?: string;
}

interface Volume {
  id: string;
  displayName: string;
  compartmentId: string;
  availabilityDomain: string;
  lifecycleState: string;
  sizeInGBs: number;
  sizeInMBs: number;
  volumeGroupId?: string;
  timeCreated: string;
  isHydrated: boolean;
  vpusPerGB: number;
}

interface Vcn {
  id: string;
  displayName: string;
  compartmentId: string;
  cidrBlock: string;
  cidrBlocks: string[];
  lifecycleState: string;
  timeCreated: string;
  defaultRouteTableId: string;
  defaultSecurityListId: string;
  defaultDhcpOptionsId: string;
  dnsLabel?: string;
}

interface DatabaseSystem {
  id: string;
  displayName: string;
  compartmentId: string;
  availabilityDomain: string;
  lifecycleState: string;
  shape: string;
  cpuCoreCount: number;
  dataStorageSizeInGBs: number;
  nodeCount: number;
  databaseEdition: string;
  timeCreated: string;
  hostname: string;
  domain: string;
  version: string;
  diskRedundancy?: string;
}

interface MetricData {
  namespace: string;
  name: string;
  compartmentId: string;
  dimensions: Record<string, string>;
  metadata: Record<string, any>;
  aggregatedDatapoints: Array<{
    timestamp: Date;
    value: number;
  }>;
}

interface Compartment {
  id: string;
  name: string;
  description: string;
  lifecycleState: string;
  timeCreated: string;
}
```

---

## RAG Service Types

Types for Retrieval-Augmented Generation service.

```typescript
interface RagCredentials {
  apiKey?: string;
  bearerToken?: string;
  customHeaders?: Record<string, string>;
}

interface RagQueryParams {
  query: string;
  topK?: number;
  threshold?: number;
  filters?: Record<string, any>;
  namespace?: string;
}

interface RagDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
  source?: string;
  timestamp?: Date;
}

interface RagQueryResponse {
  documents: RagDocument[];
  query: string;
  totalResults: number;
  processingTime?: number;
}

interface RagRetrievalParams {
  documentIds: string[];
  namespace?: string;
}

interface RagRetrievalResponse {
  documents: RagDocument[];
  notFound?: string[];
}

interface RagHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version?: string;
}

interface RagIndexStats {
  totalDocuments: number;
  namespaces?: string[];
  lastUpdated?: Date;
  indexSize?: number;
}
```

---

## AI Chat Service Types

Types for AI-powered chat functionality.

```typescript
interface AIChatCredentials {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  model: 'gemini' | 'claude' | 'deepseek' | 'openai';
  query: string;
  context?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}
```

### Agents Service Types

```typescript
interface AgentHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
}

interface AgentStatusResponse {
  agents_available: boolean;
  message: string;
  features: {
    supervisor_agent: boolean;
    rag_integration: boolean;
    tool_execution: boolean;
  };
}

interface AgentChatRequest {
  message: string;
  session_id?: string;
  context?: Record<string, any>;
}

interface AgentChatResponse {
  response: string;
  session_id: string;
}
```

---

## HTTP Action Types

Types for generic HTTP operations.

```typescript
interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}

interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  duration: number;
}
```

---

## Kafka Service Types

Types for Apache Kafka integration.

```typescript
interface KafkaConfig {
  clientId: string;
  brokers: string[];
}
```

---

## Type Constants Reference

### Node Type Categories

| Category | Constant | Description |
|----------|----------|-------------|
| Azure | `NodeTypes.AZURE` | Microsoft Azure resources |
| Kubernetes | `NodeTypes.KUBERNETES` | Kubernetes cluster resources |
| Kafka | `NodeTypes.KAFKA` | Apache Kafka components |
| GCP | `NodeTypes.GCP` | Google Cloud Platform resources |
| Generic | `NodeTypes.GENERIC` | Generic/custom nodes |

### Azure Subtypes (17 types)

`function-app`, `service-bus`, `app-service`, `cosmos-db`, `storage`, `key-vault`, `virtual-network`, `api-management`, `event-hub`, `logic-app`, `sql-database`, `redis-cache`, `cdn`, `front-door`, `application-gateway`, `container-instance`, `aks`

### Kubernetes Subtypes (14 types)

`pod`, `service`, `deployment`, `statefulset`, `daemonset`, `replicaset`, `job`, `cronjob`, `configmap`, `secret`, `ingress`, `persistentvolume`, `persistentvolumeclaim`, `namespace`

### Kafka Subtypes (6 types)

`cluster`, `topic`, `producer`, `consumer`, `connect`, `streams`

### GCP Subtypes (15 types)

`compute-engine`, `cloud-storage`, `cloud-sql`, `cloud-functions`, `pubsub`, `bigquery`, `gke`, `cloud-run`, `app-engine`, `cloud-cdn`, `cloud-dns`, `cloud-armor`, `cloud-nat`, `vpc`, `firestore`

### Service Bus Variants

`queue`, `topic`

---

## Naming Conventions

| Suffix | Purpose | Example |
|--------|---------|---------|
| `*Params` | Input parameters for operations | `MetricQueryParams` |
| `*Info` | Readonly information objects | `PodInfo` |
| `*Request` | API request bodies | `ChatRequest` |
| `*Response` | API response bodies | `ChatResponse` |
| `*Credentials` | Authentication credentials | `AzureCredentials` |
| `*Config` | Configuration objects | `KubernetesConfig` |
| `*Result` | Operation outcomes | `InsertResult` |

---

## Status Values

### Telemetry Node Status

```typescript
type NodeStatus = 'active' | 'warning' | 'error' | 'inactive';
```

### Log Levels

```typescript
type LogLevel = 'Information' | 'Warning' | 'Error' | 'Debug';
```

### Result Types

```typescript
type ResultType = 'Success' | 'Failed';
```
