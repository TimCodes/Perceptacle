/**
 * Node Type System - Server-Side Type Definitions
 * 
 * This module provides server-side type definitions and utilities
 * for the node type system, matching the client-side implementation.
 * 
 * @module server/types/nodeTypes
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
 * Kubernetes-specific subtypes.
 */
export const KubernetesSubtypes = {
  POD: 'pod',
  DEPLOYMENT: 'deployment',
  SERVICE: 'service',
  STATEFUL_SET: 'statefulset',
  DAEMON_SET: 'daemonset',
  JOB: 'job',
  CRON_JOB: 'cronjob',
  CONFIG_MAP: 'configmap',
  SECRET: 'secret',
  PERSISTENT_VOLUME: 'persistentvolume',
  PERSISTENT_VOLUME_CLAIM: 'persistentvolumeclaim',
  INGRESS: 'ingress',
  NAMESPACE: 'namespace',
  NODE: 'node'
} as const;

/**
 * Kafka-specific subtypes.
 */
export const KafkaSubtypes = {
  TOPIC: 'topic',
  PRODUCER: 'producer',
  CONSUMER: 'consumer',
  BROKER: 'broker',
  CONNECTOR: 'connector',
  STREAM: 'stream'
} as const;

/**
 * GCP-specific subtypes.
 */
export const GCPSubtypes = {
  COMPUTE_ENGINE: 'compute-engine',
  CLOUD_FUNCTION: 'cloud-function',
  CLOUD_RUN: 'cloud-run',
  APP_ENGINE: 'app-engine',
  KUBERNETES_ENGINE: 'kubernetes-engine',
  CLOUD_STORAGE: 'cloud-storage',
  FIRESTORE: 'firestore',
  CLOUD_SQL: 'cloud-sql',
  PUB_SUB: 'pub-sub',
  CLOUD_TASKS: 'cloud-tasks',
  LOAD_BALANCER: 'load-balancer'
} as const;

/**
 * Legacy type mapping for backward compatibility.
 * Maps old string-based types to new NodeTypeDefinition structure.
 */
export const LEGACY_TYPE_MAP: Record<string, NodeTypeDefinition> = {
  // Azure types
  'azure-function-app': { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP },
  'FunctionApp': { type: NodeTypes.AZURE, subtype: AzureSubtypes.FUNCTION_APP },
  'ServiceBusQueue': { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS, variant: 'queue' },
  'ServiceBusTopic': { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS, variant: 'topic' },
  'azure-service-bus': { type: NodeTypes.AZURE, subtype: AzureSubtypes.SERVICE_BUS },
  'azure-app-service': { type: NodeTypes.AZURE, subtype: AzureSubtypes.APP_SERVICE },
  'azure-cosmos-db': { type: NodeTypes.AZURE, subtype: AzureSubtypes.COSMOS_DB },
  'CosmosDB': { type: NodeTypes.AZURE, subtype: AzureSubtypes.COSMOS_DB },
  
  // Kubernetes types
  'k8s-pod': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD },
  'pod': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.POD },
  'k8s-deployment': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.DEPLOYMENT },
  'deployment': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.DEPLOYMENT },
  'k8s-service': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE },
  'service': { type: NodeTypes.KUBERNETES, subtype: KubernetesSubtypes.SERVICE },
  
  // Kafka types
  'kafka-topic': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.TOPIC },
  'kafka-producer': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.PRODUCER },
  'kafka-consumer': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.CONSUMER },
  'kafka-broker': { type: NodeTypes.KAFKA, subtype: KafkaSubtypes.BROKER },
  
  // GCP types
  'gcp-compute-engine': { type: NodeTypes.GCP, subtype: GCPSubtypes.COMPUTE_ENGINE },
  'gcp-cloud-function': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_FUNCTION },
  'gcp-cloud-run': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_RUN },
  'gcp-cloud-storage': { type: NodeTypes.GCP, subtype: GCPSubtypes.CLOUD_STORAGE },
  
  // Generic/default
  'default': { type: NodeTypes.GENERIC, subtype: 'custom' },
  'generic': { type: NodeTypes.GENERIC, subtype: 'custom' },
  'custom': { type: NodeTypes.GENERIC, subtype: 'custom' }
};

/**
 * Type guard to check if an object is a valid NodeTypeDefinition
 */
export function isNodeTypeDefinition(obj: any): obj is NodeTypeDefinition {
  return (
    obj !== null &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    typeof obj.subtype === 'string' &&
    (obj.variant === undefined || typeof obj.variant === 'string')
  );
}

/**
 * Validates a NodeTypeDefinition structure
 */
export function validateNodeType(nodeType: any): { valid: boolean; error?: string } {
  if (!nodeType) {
    return { valid: false, error: 'Node type is required' };
  }
  
  if (typeof nodeType === 'string') {
    // Legacy format - valid but should be converted
    return { valid: true };
  }
  
  if (!isNodeTypeDefinition(nodeType)) {
    return { valid: false, error: 'Invalid NodeTypeDefinition structure' };
  }
  
  if (!nodeType.type || nodeType.type.trim() === '') {
    return { valid: false, error: 'Node type.type field is required' };
  }
  
  if (!nodeType.subtype || nodeType.subtype.trim() === '') {
    return { valid: false, error: 'Node type.subtype field is required' };
  }
  
  return { valid: true };
}
