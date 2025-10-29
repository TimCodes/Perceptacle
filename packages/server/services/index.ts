// Main exports for Perceptacle services
export * from './azure';
export * from './azure.mock';
export * from './kubernetes';
export * from './kubernetes.mock';
export * from './github';
export * from './github.mock';
export * from './oracle';
export * from './oracle.mock';
export * from './aichat';
export * from './aichat.mock';
export * from './service-factory';

// Re-export commonly used types and classes
export { AzureService } from './azure';
export { MockAzureService } from './azure.mock';
export { KubernetesService } from './kubernetes';
export { MockKubernetesService } from './kubernetes.mock';
export { GitHubService } from './github';
export { MockGitHubService } from './github.mock';
export { OracleService } from './oracle';
export { MockOracleService } from './oracle.mock';
export { AIChatService } from './aichat';
export { MockAIChatService } from './aichat.mock';
export { ServiceFactory, serviceFactory, createServiceFactoryFromEnv } from './service-factory';

// Type helpers
export type {
  // Azure types
  AzureCredentials,
  ResourceQueryParams,
  MetricQueryParams,
  LogQueryParams,
  ResourceMetric,
  ResourceLog,
  ServiceBusQueueInfo,
  ServiceBusTopicInfo,
  ServiceBusSubscriptionInfo,
  ServiceBusNamespaceSummary
} from './azure';

export type {
  // Kubernetes types
  KubernetesConfig,
  PodLogParams,
  PodMetrics,
  ContainerMetrics,
  ServiceInfo,
  ServicePort,
  EndpointInfo,
  ClusterInfo,
  NodeInfo,
  NodeCapacity,
  NodeCondition,
  PodInfo,
  PodContainer,
  DeploymentInfo,
  NamespaceResourceUsage
} from './kubernetes';

export type {
  // GitHub types
  GitHubCredentials,
  PullRequestParams,
  WorkflowRunParams,
  BranchParams,
  IssueParams,
  CreateIssueParams,
  PullRequest,
  WorkflowRun,
  Branch,
  Issue
} from './github';

export type {
  // Oracle types
  OracleCredentials,
  ComputeInstanceParams,
  VolumeParams,
  VcnParams,
  DatabaseParams,
  MetricParams,
  ComputeInstance,
  Volume,
  Vcn,
  DatabaseSystem,
  MetricData,
  Compartment
} from './oracle';
  // AIChat types
  AIChatCredentials,
  ChatMessage,
  ChatRequest,
  ChatResponse
} from './aichat';

export type {
  // Service factory types
  ServiceFactoryConfig
} from './service-factory';
