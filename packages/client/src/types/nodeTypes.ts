/**
 * Node Type System - Core Type Definitions
 * 
 * This module provides a centralized, strongly-typed node type system
 * for the Perceptacle infrastructure diagram application.
 * 
 * @module nodeTypes
 */

/**
 * Primary node type definition interface.
 * Represents a structured type system with type, subtype, and optional variant.
 * 
 * @example
 * // Azure Function App
 * { type: 'azure', subtype: 'function-app' }
 * 
 * @example
 * // Service Bus Queue (with variant)
 * { type: 'azure', subtype: 'service-bus', variant: 'queue' }
 * 
 * @example
 * // Kubernetes Pod
 * { type: 'kubernetes', subtype: 'pod' }
 */
export interface NodeTypeDefinition {
  /** Primary category (e.g., 'azure', 'kubernetes', 'kafka', 'gcp') */
  type: string;
  
  /** Specific resource type within the category (e.g., 'function-app', 'pod', 'topic') */
  subtype: string;
  
  /** Optional variant for subtypes with multiple flavors (e.g., 'queue' vs 'topic' for service-bus) */
  variant?: string;
}

/**
 * Primary node type categories.
 * Use these constants instead of magic strings.
 * 
 * @example
 * if (node.type === NodeTypes.AZURE) { ... }
 */
export const NodeTypes = {
  /** Microsoft Azure cloud services */
  AZURE: 'azure',
  
  /** Kubernetes orchestration resources */
  KUBERNETES: 'kubernetes',
  
  /** Apache Kafka streaming platform */
  KAFKA: 'kafka',
  
  /** Google Cloud Platform services */
  GCP: 'gcp',
  
  /** Generic/custom node types */
  GENERIC: 'generic'
} as const;

/**
 * Type for NodeTypes constant values
 */
export type NodeType = typeof NodeTypes[keyof typeof NodeTypes];

/**
 * Azure-specific subtypes.
 * All Azure service types available in the system.
 */
export const AzureSubtypes = {
  FUNCTION_APP: 'function-app',
  SERVICE_BUS: 'service-bus',
  APP_SERVICE: 'app-service',
  COSMOS_DB: 'cosmos-db',
  KEY_VAULT: 'key-vault',
  APPLICATION_INSIGHTS: 'application-insights',
  VIRTUAL_NETWORK: 'virtual-network',
  FIREWALL: 'firewall',
  APPLICATION_GATEWAY: 'application-gateway',
  STORAGE_ACCOUNT: 'storage-account',
  SQL_DATABASE: 'sql-database',
  REDIS_CACHE: 'redis-cache',
  EVENT_HUB: 'event-hub',
  LOGIC_APP: 'logic-app',
  API_MANAGEMENT: 'api-management',
  CONTAINER_INSTANCE: 'container-instance',
  KUBERNETES_SERVICE: 'kubernetes-service'
} as const;

/**
 * Type for Azure subtypes
 */
export type AzureSubtype = typeof AzureSubtypes[keyof typeof AzureSubtypes];

/**
 * Kubernetes-specific subtypes.
 * All Kubernetes resource types available in the system.
 */
export const KubernetesSubtypes = {
  POD: 'pod',
  SERVICE: 'service',
  DEPLOYMENT: 'deployment',
  STATEFULSET: 'statefulset',
  DAEMONSET: 'daemonset',
  CRONJOB: 'cronjob',
  JOB: 'job',
  CONFIGMAP: 'configmap',
  SECRET: 'secret',
  INGRESS: 'ingress',
  PERSISTENT_VOLUME: 'persistent-volume',
  PERSISTENT_VOLUME_CLAIM: 'persistent-volume-claim',
  NAMESPACE: 'namespace',
  REPLICA_SET: 'replica-set'
} as const;

/**
 * Type for Kubernetes subtypes
 */
export type KubernetesSubtype = typeof KubernetesSubtypes[keyof typeof KubernetesSubtypes];

/**
 * Kafka-specific subtypes.
 * All Kafka component types available in the system.
 */
export const KafkaSubtypes = {
  CLUSTER: 'cluster',
  TOPIC: 'topic',
  PRODUCER: 'producer',
  CONSUMER: 'consumer',
  CONNECT: 'connect',
  STREAMS: 'streams'
} as const;

/**
 * Type for Kafka subtypes
 */
export type KafkaSubtype = typeof KafkaSubtypes[keyof typeof KafkaSubtypes];

/**
 * GCP-specific subtypes.
 * All Google Cloud Platform service types available in the system.
 */
export const GCPSubtypes = {
  COMPUTE_ENGINE: 'compute-engine',
  CLOUD_STORAGE: 'cloud-storage',
  CLOUD_SQL: 'cloud-sql',
  KUBERNETES_ENGINE: 'kubernetes-engine',
  CLOUD_FUNCTIONS: 'cloud-functions',
  CLOUD_RUN: 'cloud-run',
  LOAD_BALANCER: 'load-balancer',
  CLOUD_ARMOR: 'cloud-armor',
  APP_ENGINE: 'app-engine',
  VPC_NETWORK: 'vpc-network',
  CLOUD_PUBSUB: 'cloud-pubsub',
  CLOUD_SPANNER: 'cloud-spanner',
  BIGTABLE: 'bigtable',
  DATASTORE: 'datastore',
  FIRESTORE: 'firestore'
} as const;

/**
 * Type for GCP subtypes
 */
export type GCPSubtype = typeof GCPSubtypes[keyof typeof GCPSubtypes];

/**
 * Service Bus variants (Queue vs Topic)
 */
export const ServiceBusVariants = {
  QUEUE: 'queue',
  TOPIC: 'topic'
} as const;

/**
 * Message protocol types supported by nodes
 */
export type MessageProtocol = 'http' | 'https' | 'kafka' | 'service-bus' | 'grpc' | 'websocket';

/**
 * Configuration field definition for dynamic forms
 */
export interface ConfigField {
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

/**
 * Node capabilities - features available for a specific node type
 */
export interface NodeCapabilities {
  /** Can fetch and display metrics/telemetry */
  hasMetrics?: boolean;
  
  /** Can fetch and display logs */
  hasLogs?: boolean;
  
  /** Can send/receive messages */
  hasMessages?: boolean;
  
  /** Message protocol used by this node */
  messageProtocol?: MessageProtocol;
  
  /** Can perform health checks */
  hasHealthCheck?: boolean;
  
  /** Supports auto-scaling */
  hasAutoScaling?: boolean;
  
  /** Has network/security configuration */
  hasNetworkConfig?: boolean;
}

/**
 * Resource mapping for cloud providers
 */
export interface ResourceMapping {
  /** Cloud provider resource type (e.g., 'Microsoft.Web/sites') */
  provider: string;
  
  /** Function to build resource ID from node data */
  buildId?: (data: any) => string;
  
  /** API version for cloud provider API calls */
  apiVersion?: string;
}

/**
 * Complete registered node type with all metadata
 */
export interface RegisteredNodeType {
  /** Primary type category */
  type: string;
  
  /** Specific subtype */
  subtype: string;
  
  /** Optional variant */
  variant?: string;
  
  /** Display name shown in UI */
  displayName: string;
  
  /** Icon component (lazy-loaded) */
  icon?: any;
  
  /** Category for grouping in UI */
  category: string;
  
  /** Type-specific configuration fields */
  fields?: ConfigField[];
  
  /** Node capabilities and features */
  capabilities: NodeCapabilities;
  
  /** Cloud provider resource mapping */
  resourceMapping?: ResourceMapping;
  
  /** Description for documentation */
  description?: string;
  
  /** Tags for searchability */
  tags?: string[];
}

/**
 * Node type registry - centralized source of truth
 */
export type NodeTypeRegistry = RegisteredNodeType[];

/**
 * Legacy type conversion map
 */
export const LEGACY_TYPE_MAP: Record<string, NodeTypeDefinition> = {
  // Azure legacy types
  'azure-function-app': { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP },
  'AzureFunction': { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP },
  'azure-service-bus': { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS },
  'ServiceBusQueue': { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS, variant: ServiceBusVariants.QUEUE },
  'ServiceBusTopic': { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS, variant: ServiceBusVariants.TOPIC },
  'azure-app-service': { type: NodeTypes.AZURE, subtype: AzureSubtypes.APP_SERVICE },
  'azure-cosmos-db': { type: NodeTypes.AZURE, subtype: AzureSubtypes.COSMOS_DB },
  'azure-key-vault': { type: NodeTypes.AZURE, subtype: AzureSubtypes.KEY_VAULT },
  'azure-application-insights': { type: NodeTypes.AZURE, subtype: AzureSubtypes.APPLICATION_INSIGHTS },
  'azure-virtual-network': { type: NodeTypes.AZURE, subtype: AzureSubtypes.VIRTUAL_NETWORK },
  'azure-firewall': { type: NodeTypes.AZURE, subtype: AzureSubtypes.FIREWALL },
  'azure-application-gateway': { type: NodeTypes.AZURE, subtype: AzureSubtypes.APPLICATION_GATEWAY },
  'AppGateway': { type: NodeTypes.AZURE, subtype: AzureSubtypes.APPLICATION_GATEWAY },
  
  // Kubernetes legacy types
  'k8s-pod': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD },
  'Pod': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD },
  'KubernetesPod': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD },
  'k8s-service': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE },
  'Service': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE },
  'KubernetesService': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE },
  'kubernetes-service': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE },
  'k8s-deployment': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.DEPLOYMENT },
  'k8s-statefulset': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.STATEFULSET },
  'k8s-daemonset': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.DAEMONSET },
  'k8s-cronjob': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.CRONJOB },
  
  // Kafka legacy types
  'kafka-cluster': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.CLUSTER },
  'kafka-topic': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.TOPIC },
  'KafkaTopic': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.TOPIC },
  
  // GCP legacy types
  'compute-engine': { type: NodeTypes.GCP, subtype: GCPSubtypes.COMPUTE_ENGINE },
  'cloud-storage': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_STORAGE },
  'cloud-sql': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_SQL },
  'kubernetes-engine': { type: NodeTypes.GCP, subtype: GCPSubtypes.KUBERNETES_ENGINE },
  'cloud-functions': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_FUNCTIONS },
  'GoogleCloudFunction': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_FUNCTIONS },
  'cloud-run': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_RUN },
  'load-balancer': { type: NodeTypes.GCP, subtype: GCPSubtypes.LOAD_BALANCER },
  'cloud-armor': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_ARMOR },
  'app-engine': { type: NodeTypes.GCP, subtype: GCPSubtypes.APP_ENGINE },
  'vpc-network': { type: NodeTypes.GCP, subtype: GCPSubtypes.VPC_NETWORK }
};
