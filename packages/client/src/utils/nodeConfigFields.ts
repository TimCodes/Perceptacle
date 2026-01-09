// Application node configuration field definitions
export interface ConfigField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'url';
  required?: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
}

// Default fields that all application nodes have
export const DEFAULT_FIELDS: ConfigField[] = [
  {
    name: 'label',
    label: 'Label',
    type: 'text',
    required: true,
    placeholder: 'Enter application node label'
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: ['active', 'warning', 'error', 'inactive']
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Enter description'
  },
  {
    name: 'githubUrl',
    label: 'GitHub URL',
    type: 'url',
    placeholder: 'https://github.com/username/repository',
    description: 'Link to the GitHub repository for this component'
  },

];

// Azure-specific fields for metrics and log collection
export const AZURE_FIELDS: ConfigField[] = [
  {
    name: 'subscriptionId',
    label: 'Subscription ID',
    type: 'text',
    required: true,
    placeholder: 'Azure subscription ID',
    description: 'The Azure subscription ID where this resource is located'
  },
  {
    name: 'resourceGroup',
    label: 'Resource Group',
    type: 'text',
    required: true,
    placeholder: 'Resource group name',
    description: 'The Azure resource group containing this resource'
  },
  {
    name: 'resourceName',
    label: 'Resource Name',
    type: 'text',
    required: true,
    placeholder: 'Azure resource name',
    description: 'The actual name of the Azure resource'
  },
  {
    name: 'location',
    label: 'Location',
    type: 'text',
    placeholder: 'Azure region (e.g., eastus)',
    description: 'The Azure region where the resource is deployed'
  },
  {
    name: 'workspaceId',
    label: 'Log Analytics Workspace ID',
    type: 'text',
    placeholder: 'Log Analytics workspace ID',
    description: 'Required for querying logs from Application Insights or Log Analytics'
  },
  {
    name: 'instrumentationKey',
    label: 'Instrumentation Key',
    type: 'text',
    placeholder: 'Application Insights instrumentation key',
    description: 'For Application Insights components'
  }
];

// Kubernetes-specific fields for metrics and log collection
export const KUBERNETES_FIELDS: ConfigField[] = [
  {
    name: 'namespace',
    label: 'Namespace',
    type: 'text',
    required: true,
    placeholder: 'Kubernetes namespace (e.g., default)',
    description: 'The Kubernetes namespace where this resource is deployed'
  },
  {
    name: 'resourceName',
    label: 'Resource Name',
    type: 'text',
    required: true,
    placeholder: 'Kubernetes resource name',
    description: 'The actual name of the Kubernetes resource (pod, service, etc.)'
  },
  {
    name: 'clusterName',
    label: 'Cluster Name',
    type: 'text',
    placeholder: 'Kubernetes cluster name',
    description: 'The name of the Kubernetes cluster (optional, for multi-cluster setups)'
  },
  {
    name: 'clusterEndpoint',
    label: 'Cluster Endpoint',
    type: 'url',
    placeholder: 'https://k8s-cluster.example.com',
    description: 'The Kubernetes API server endpoint (if different from default kubeconfig)'
  },
  {
    name: 'serviceAccount',
    label: 'Service Account',
    type: 'text',
    placeholder: 'Service account name',
    description: 'The service account used for authentication (optional)'
  },
  {
    name: 'containerName',
    label: 'Container Name',
    type: 'text',
    placeholder: 'Container name (for pods)',
    description: 'Specific container name within the pod (for log collection)'
  }
];

// Kafka-specific fields (since it's included in Kubernetes components)
export const KAFKA_FIELDS: ConfigField[] = [
  {
    name: 'brokerList',
    label: 'Broker List',
    type: 'text',
    required: true,
    placeholder: 'localhost:9092,broker2:9092',
    description: 'Comma-separated list of Kafka broker addresses'
  },
  {
    name: 'topicName',
    label: 'Topic Name',
    type: 'text',
    placeholder: 'my-topic',
    description: 'Kafka topic name (for topic components)'
  },
  {
    name: 'consumerGroup',
    label: 'Consumer Group',
    type: 'text',
    placeholder: 'my-consumer-group',
    description: 'Kafka consumer group for monitoring'
  },
  {
    name: 'securityProtocol',
    label: 'Security Protocol',
    type: 'select',
    options: ['PLAINTEXT', 'SSL', 'SASL_PLAINTEXT', 'SASL_SSL'],
    placeholder: 'Security protocol',
    description: 'Kafka security protocol configuration'
  }
];

// Google Cloud Platform-specific fields for metrics and log collection
export const GCP_FIELDS: ConfigField[] = [
  {
    name: 'projectId',
    label: 'Project ID',
    type: 'text',
    required: true,
    placeholder: 'my-gcp-project',
    description: 'The Google Cloud Project ID where this resource is located'
  },
  {
    name: 'resourceName',
    label: 'Resource Name',
    type: 'text',
    required: true,
    placeholder: 'my-compute-instance',
    description: 'The actual name of the GCP resource'
  },
  {
    name: 'zone',
    label: 'Zone',
    type: 'text',
    placeholder: 'us-central1-a',
    description: 'GCP zone where the resource is deployed'
  },
  {
    name: 'region',
    label: 'Region',
    type: 'text',
    placeholder: 'us-central1',
    description: 'GCP region where the resource is deployed'
  },
  {
    name: 'serviceAccount',
    label: 'Service Account',
    type: 'text',
    placeholder: 'service-account@project.iam.gserviceaccount.com',
    description: 'Service account email for authentication'
  },
  {
    name: 'monitoringLabels',
    label: 'Monitoring Labels',
    type: 'text',
    placeholder: 'env=prod,team=backend',
    description: 'Comma-separated key=value pairs for resource labeling'
  },
  {
    name: 'logType',
    label: 'Log Type',
    type: 'select',
    options: ['cloud-audit', 'data-access', 'system-event', 'admin-activity'],
    placeholder: 'Select log type',
    description: 'Type of logs to collect from this resource'
  }
];

// List of GCP component types for identification
const GCP_COMPONENT_TYPES = [
  'compute-engine',
  'cloud-storage',
  'cloud-sql',
  'kubernetes-engine',
  'cloud-functions',
  'cloud-run',
  'load-balancer',
  'cloud-armor',
  'app-engine',
  'vpc-network'
];

// Function to get configuration fields for a specific node type
export function getConfigFieldsForNodeType(nodeType: string): ConfigField[] {
  const isAzureNode = nodeType.startsWith('azure-');
  const isKubernetesNode = nodeType.startsWith('k8s-');
  const isKafkaNode = nodeType.startsWith('kafka-');
  const isGCPNode = GCP_COMPONENT_TYPES.includes(nodeType);

  if (isAzureNode) {
    return [...DEFAULT_FIELDS, ...AZURE_FIELDS];
  }

  if (isKubernetesNode) {
    return [...DEFAULT_FIELDS, ...KUBERNETES_FIELDS];
  }

  if (isKafkaNode) {
    return [...DEFAULT_FIELDS, ...KAFKA_FIELDS];
  }

  if (isGCPNode) {
    return [...DEFAULT_FIELDS, ...GCP_FIELDS];
  }

  // Return only default fields for other node types
  return DEFAULT_FIELDS;
}

// Function to get the default values for Azure fields
export function getAzureDefaultValues(): Record<string, string> {
  return {
    subscriptionId: '',
    resourceGroup: '',
    resourceName: '',
    location: '',
    workspaceId: '',
    instrumentationKey: ''
  };
}

// Function to get the default values for Kubernetes fields
export function getKubernetesDefaultValues(): Record<string, string> {
  return {
    namespace: 'default',
    resourceName: '',
    clusterName: '',
    clusterEndpoint: '',
    serviceAccount: '',
    containerName: ''
  };
}

// Function to get the default values for Kafka fields
export function getKafkaDefaultValues(): Record<string, string> {
  return {
    brokerList: '',
    topicName: '',
    consumerGroup: '',
    securityProtocol: 'PLAINTEXT'
  };
}

// Function to get the default values for GCP fields
export function getGCPDefaultValues(): Record<string, string> {
  return {
    projectId: '',
    resourceName: '',
    zone: '',
    region: '',
    serviceAccount: '',
    monitoringLabels: '',
    logType: 'system-event'
  };
}

// Function to build Azure resource ID from component fields
export function buildAzureResourceId(data: any, nodeType: string): string {
  const { subscriptionId, resourceGroup, resourceName } = data;

  if (!subscriptionId || !resourceGroup || !resourceName) {
    return '';
  }

  // Map node types to Azure resource provider types
  const resourceTypeMap: Record<string, string> = {
    'azure-function-app': 'Microsoft.Web/sites',
    'azure-service-bus': 'Microsoft.ServiceBus/namespaces',
    'azure-application-insights': 'Microsoft.Insights/components',
    'azure-virtual-network': 'Microsoft.Network/virtualNetworks',
    'azure-app-service': 'Microsoft.Web/sites',
    'azure-firewall': 'Microsoft.Network/azureFirewalls',
    'azure-application-gateway': 'Microsoft.Network/applicationGateways',
    'azure-key-vault': 'Microsoft.KeyVault/vaults',
    'azure-cosmos-db': 'Microsoft.DocumentDB/databaseAccounts'
  };

  const resourceType = resourceTypeMap[nodeType];
  if (!resourceType) {
    return '';
  }

  return `/subscriptions/${subscriptionId}/resourceGroups/${resourceGroup}/providers/${resourceType}/${resourceName}`;
}

// Function to build Kubernetes resource identifier from component fields
export function buildKubernetesResourceId(data: any, nodeType: string): string {
  const { namespace, resourceName, clusterName } = data;

  if (!namespace || !resourceName) {
    return '';
  }

  // Map node types to Kubernetes resource types
  const resourceTypeMap: Record<string, string> = {
    'k8s-pod': 'pods',
    'k8s-service': 'services',
    'k8s-cronjob': 'cronjobs'
  };

  const resourceType = resourceTypeMap[nodeType];
  if (!resourceType) {
    return '';
  }

  // Build resource identifier in the format: [cluster]/namespace/resourceType/resourceName
  const clusterPrefix = clusterName ? `${clusterName}/` : '';
  return `${clusterPrefix}${namespace}/${resourceType}/${resourceName}`;
}

// Function to build Kafka resource identifier from component fields
export function buildKafkaResourceId(data: any, nodeType: string): string {
  const { brokerList, topicName } = data;

  if (!brokerList) {
    return '';
  }

  if (nodeType === 'kafka-cluster') {
    return brokerList;
  }

  if (nodeType === 'kafka-topic' && topicName) {
    const cluster = brokerList.split(',')[0]; // Use first broker as cluster identifier
    return `${cluster}/${topicName}`;
  }

  return brokerList;
}

// Function to build GCP resource identifier from component fields
export function buildGCPResourceId(data: any, nodeType: string): string {
  const { projectId, resourceName, zone, region } = data;

  if (!projectId || !resourceName) {
    return '';
  }

  // Map node types to GCP resource types and determine if zonal or regional
  const resourceConfig: Record<string, { type: string; isZonal: boolean }> = {
    'compute-engine': { type: 'instances', isZonal: true },
    'cloud-storage': { type: 'buckets', isZonal: false },
    'cloud-sql': { type: 'instances', isZonal: false },
    'kubernetes-engine': { type: 'clusters', isZonal: true },
    'cloud-functions': { type: 'functions', isZonal: false },
    'cloud-run': { type: 'services', isZonal: false },
    'load-balancer': { type: 'forwardingRules', isZonal: false },
    'cloud-armor': { type: 'securityPolicies', isZonal: false },
    'app-engine': { type: 'services', isZonal: false },
    'vpc-network': { type: 'networks', isZonal: false }
  };

  const config = resourceConfig[nodeType];
  if (!config) {
    return `projects/${projectId}`;
  }

  // Build resource path based on whether it's zonal or regional
  if (config.isZonal && zone) {
    return `projects/${projectId}/zones/${zone}/${config.type}/${resourceName}`;
  } else if (!config.isZonal && region) {
    return `projects/${projectId}/regions/${region}/${config.type}/${resourceName}`;
  } else {
    // Global resource
    return `projects/${projectId}/global/${config.type}/${resourceName}`;
  }
}
