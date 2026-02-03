/**
 * Node Type Registry - Centralized Source of Truth
 * 
 * This module contains the complete registry of all supported node types
 * with their metadata, capabilities, and configuration.
 * 
 * MOCK SERVER MODE: Only Azure and Kubernetes node types
 * 
 * @module nodeTypeRegistry
 */

import {
  NodeTypes,
  AzureSubtypes,
  KubernetesSubtypes,
  type RegisteredNodeType,
  type NodeTypeRegistry
} from './nodeTypes';

/**
 * Complete node type registry.
 * This is the single source of truth for all supported node types.
 * 
 * To add a new node type:
 * 1. Add the subtype constant to nodeTypes.ts
 * 2. Add a registry entry here with all required metadata
 * 3. Optionally add an icon component
 * 4. Document the capabilities
 */
export const NODE_TYPE_REGISTRY: NodeTypeRegistry = [
  // ============================================================================
  // AZURE NODE TYPES
  // ============================================================================
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.FUNCTION_APP,
    displayName: 'Azure Function App',
    category: 'Serverless',
    description: 'Serverless compute service for event-driven applications',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasMessages: true,
      messageProtocol: 'https',
      hasHealthCheck: true,
      hasAutoScaling: true
    },
    resourceMapping: {
      provider: 'Microsoft.Web/sites',
      apiVersion: '2022-03-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Web/sites/${data.name}`;
      }
    },
    tags: ['azure', 'serverless', 'function', 'compute']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.SERVICE_BUS,
    variant: 'queue',
    displayName: 'Service Bus Queue',
    category: 'Messaging',
    description: 'Message queue for reliable asynchronous messaging',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasMessages: true,
      messageProtocol: 'service-bus'
    },
    resourceMapping: {
      provider: 'Microsoft.ServiceBus/namespaces/queues',
      apiVersion: '2021-11-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.namespace || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.ServiceBus/namespaces/${data.namespace}/queues/${data.name}`;
      }
    },
    tags: ['azure', 'messaging', 'queue', 'service-bus']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.SERVICE_BUS,
    variant: 'topic',
    displayName: 'Service Bus Topic',
    category: 'Messaging',
    description: 'Pub/sub messaging for event-driven architectures',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasMessages: true,
      messageProtocol: 'service-bus'
    },
    resourceMapping: {
      provider: 'Microsoft.ServiceBus/namespaces/topics',
      apiVersion: '2021-11-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.namespace || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.ServiceBus/namespaces/${data.namespace}/topics/${data.name}`;
      }
    },
    tags: ['azure', 'messaging', 'topic', 'pubsub', 'service-bus']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.APP_SERVICE,
    displayName: 'Azure App Service',
    category: 'Compute',
    description: 'Platform for building and hosting web apps',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasMessages: true,
      messageProtocol: 'https',
      hasHealthCheck: true,
      hasAutoScaling: true
    },
    resourceMapping: {
      provider: 'Microsoft.Web/sites',
      apiVersion: '2022-03-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Web/sites/${data.name}`;
      }
    },
    tags: ['azure', 'web', 'app-service', 'compute']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.COSMOS_DB,
    displayName: 'Azure Cosmos DB',
    category: 'Database',
    description: 'Globally distributed, multi-model database service',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasHealthCheck: true
    },
    resourceMapping: {
      provider: 'Microsoft.DocumentDB/databaseAccounts',
      apiVersion: '2023-04-15',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.DocumentDB/databaseAccounts/${data.name}`;
      }
    },
    tags: ['azure', 'database', 'cosmos', 'nosql']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.KEY_VAULT,
    displayName: 'Azure Key Vault',
    category: 'Security',
    description: 'Secure secrets, keys, and certificates management',
    capabilities: {
      hasMetrics: true,
      hasLogs: true
    },
    resourceMapping: {
      provider: 'Microsoft.KeyVault/vaults',
      apiVersion: '2023-02-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.KeyVault/vaults/${data.name}`;
      }
    },
    tags: ['azure', 'security', 'secrets', 'key-vault']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.APPLICATION_INSIGHTS,
    displayName: 'Application Insights',
    category: 'Monitoring',
    description: 'Application performance monitoring and analytics',
    capabilities: {
      hasMetrics: true,
      hasLogs: true
    },
    resourceMapping: {
      provider: 'Microsoft.Insights/components',
      apiVersion: '2020-02-02',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Insights/components/${data.name}`;
      }
    },
    tags: ['azure', 'monitoring', 'observability', 'apm']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.VIRTUAL_NETWORK,
    displayName: 'Virtual Network',
    category: 'Network',
    description: 'Isolated private network in Azure',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasNetworkConfig: true
    },
    resourceMapping: {
      provider: 'Microsoft.Network/virtualNetworks',
      apiVersion: '2023-04-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Network/virtualNetworks/${data.name}`;
      }
    },
    tags: ['azure', 'network', 'vnet', 'infrastructure']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.FIREWALL,
    displayName: 'Azure Firewall',
    category: 'Security',
    description: 'Cloud-native network security service',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasNetworkConfig: true
    },
    resourceMapping: {
      provider: 'Microsoft.Network/azureFirewalls',
      apiVersion: '2023-04-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Network/azureFirewalls/${data.name}`;
      }
    },
    tags: ['azure', 'security', 'firewall', 'network']
  },
  
  {
    type: NodeTypes.AZURE,
    subtype: AzureSubtypes.APPLICATION_GATEWAY,
    displayName: 'Application Gateway',
    category: 'Network',
    description: 'Web traffic load balancer and application firewall',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasHealthCheck: true,
      hasNetworkConfig: true
    },
    resourceMapping: {
      provider: 'Microsoft.Network/applicationGateways',
      apiVersion: '2023-04-01',
      buildId: (data: any) => {
        if (!data.subscriptionId || !data.resourceGroup || !data.name) {
          return '';
        }
        return `/subscriptions/${data.subscriptionId}/resourceGroups/${data.resourceGroup}/providers/Microsoft.Network/applicationGateways/${data.name}`;
      }
    },
    tags: ['azure', 'load-balancer', 'gateway', 'network']
  },
  
  // ============================================================================
  // KUBERNETES NODE TYPES
  // ============================================================================
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.POD,
    displayName: 'Kubernetes Pod',
    category: 'Compute',
    description: 'Smallest deployable unit in Kubernetes',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasHealthCheck: true
    },
    tags: ['kubernetes', 'k8s', 'pod', 'compute']
  },
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.SERVICE,
    displayName: 'Kubernetes Service',
    category: 'Network',
    description: 'Service abstraction for pod networking',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasNetworkConfig: true
    },
    tags: ['kubernetes', 'k8s', 'service', 'network']
  },
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.DEPLOYMENT,
    displayName: 'Kubernetes Deployment',
    category: 'Compute',
    description: 'Declarative updates for Pods and ReplicaSets',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasAutoScaling: true,
      hasHealthCheck: true
    },
    tags: ['kubernetes', 'k8s', 'deployment', 'compute']
  },
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.STATEFULSET,
    displayName: 'Kubernetes StatefulSet',
    category: 'Compute',
    description: 'Manages stateful applications with persistent storage',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasHealthCheck: true
    },
    tags: ['kubernetes', 'k8s', 'statefulset', 'stateful', 'compute']
  },
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.DAEMONSET,
    displayName: 'Kubernetes DaemonSet',
    category: 'Compute',
    description: 'Ensures a pod runs on all nodes',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasHealthCheck: true
    },
    tags: ['kubernetes', 'k8s', 'daemonset', 'compute']
  },
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.CRONJOB,
    displayName: 'Kubernetes CronJob',
    category: 'Compute',
    description: 'Scheduled job execution',
    capabilities: {
      hasMetrics: true,
      hasLogs: true
    },
    tags: ['kubernetes', 'k8s', 'cronjob', 'scheduled', 'compute']
  },
  
  {
    type: NodeTypes.KUBERNETES,
    subtype: KubernetesSubtypes.INGRESS,
    displayName: 'Kubernetes Ingress',
    category: 'Network',
    description: 'HTTP/HTTPS routing to services',
    capabilities: {
      hasMetrics: true,
      hasLogs: true,
      hasNetworkConfig: true
    },
    tags: ['kubernetes', 'k8s', 'ingress', 'network', 'routing']
  }
];

/**
 * Frozen registry to prevent runtime modifications.
 * Use this for read-only access.
 */
export const IMMUTABLE_NODE_TYPE_REGISTRY = Object.freeze(NODE_TYPE_REGISTRY) as Readonly<NodeTypeRegistry>;

/**
 * Get a registry entry by type and subtype.
 * 
 * @param type - Primary node type
 * @param subtype - Node subtype
 * @param variant - Optional variant
 * @returns Registry entry or undefined if not found
 */
export function getRegistryEntry(
  type: string,
  subtype: string,
  variant?: string
): RegisteredNodeType | undefined {
  return NODE_TYPE_REGISTRY.find(
    entry => 
      entry.type === type && 
      entry.subtype === subtype &&
      (variant ? entry.variant === variant : !entry.variant)
  );
}

/**
 * Get all registry entries for a specific type.
 * 
 * @param type - Primary node type
 * @returns Array of registry entries
 */
export function getRegistryEntriesByType(type: string): RegisteredNodeType[] {
  return NODE_TYPE_REGISTRY.filter(entry => entry.type === type);
}

/**
 * Get all registry entries for a specific category.
 * 
 * @param category - Category name
 * @returns Array of registry entries
 */
export function getRegistryEntriesByCategory(category: string): RegisteredNodeType[] {
  return NODE_TYPE_REGISTRY.filter(entry => entry.category === category);
}

/**
 * Search registry by tags.
 * 
 * @param tags - Tags to search for
 * @returns Array of registry entries matching any tag
 */
export function searchRegistryByTags(tags: string[]): RegisteredNodeType[] {
  return NODE_TYPE_REGISTRY.filter(entry => 
    entry.tags?.some(tag => tags.includes(tag))
  );
}

/**
 * Get all unique categories from the registry.
 * 
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  return [...new Set(NODE_TYPE_REGISTRY.map(entry => entry.category))];
}

/**
 * Validate registry integrity (no duplicates).
 * Throws error if duplicates found.
 */
export function validateRegistry(): void {
  const seen = new Set<string>();
  
  for (const entry of NODE_TYPE_REGISTRY) {
    const key = `${entry.type}:${entry.subtype}:${entry.variant || ''}`;
    if (seen.has(key)) {
      throw new Error(`Duplicate registry entry found: ${key}`);
    }
    seen.add(key);
  }
}

// Validate on module load
validateRegistry();
