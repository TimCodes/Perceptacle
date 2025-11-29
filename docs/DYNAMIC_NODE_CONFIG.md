# Dynamic Node Configuration Feature

## Overview

The node configuration system now supports dynamic field rendering based on the node type. This enables Azure nodes, Kubernetes nodes, and Kafka nodes to have additional fields required for metrics and log collection, while maintaining the standard fields (Label, Status, Description) for all node types.

## Features

### Default Fields (All Nodes)
- **Label**: Node display name
- **Status**: Node status (active, warning, error, inactive)
- **Description**: Node description text

### Azure-Specific Fields (Azure Nodes Only)
When a node type starts with `azure-`, additional fields are automatically shown:

- **Subscription ID**: Azure subscription ID where the resource is located (required)
- **Resource Group**: Azure resource group containing the resource (required)
- **Resource Name**: The actual name of the Azure resource (required)
- **Location**: Azure region where the resource is deployed (optional)
- **Log Analytics Workspace ID**: Required for querying logs (optional)
- **Instrumentation Key**: For Application Insights components (optional)

### Kubernetes-Specific Fields (Kubernetes Nodes Only)
When a node type starts with `k8s-`, additional fields are automatically shown:

- **Namespace**: Kubernetes namespace where the resource is deployed (required, defaults to "default")
- **Resource Name**: The actual name of the Kubernetes resource (required)
- **Cluster Name**: The name of the Kubernetes cluster (optional, for multi-cluster setups)
- **Cluster Endpoint**: The Kubernetes API server endpoint (optional, if different from kubeconfig)
- **Service Account**: Service account used for authentication (optional)
- **Container Name**: Specific container name within the pod (optional, for log collection)

### Kafka-Specific Fields (Kafka Nodes Only)
When a node type starts with `kafka-`, additional fields are automatically shown:

- **Broker List**: Comma-separated list of Kafka broker addresses (required)
- **Topic Name**: Kafka topic name (optional, for topic components)
- **Consumer Group**: Kafka consumer group for monitoring (optional)
- **Security Protocol**: Kafka security protocol (PLAINTEXT, SSL, SASL_PLAINTEXT, SASL_SSL)

### Google Cloud Platform-Specific Fields (GCP Nodes Only)
When a node type matches a GCP component type (`compute-engine`, `cloud-storage`, etc.), additional fields are automatically shown:

- **Project ID**: Google Cloud Project ID where the resource is located (required)
- **Resource Name**: The actual name of the GCP resource (required)
- **Zone**: GCP zone where the resource is deployed (optional)
- **Region**: GCP region where the resource is deployed (optional)
- **Service Account**: Service account email for authentication (optional)
- **Monitoring Labels**: Comma-separated key=value pairs for resource labeling (optional)
- **Log Type**: Type of logs to collect (cloud-audit, data-access, system-event, admin-activity)

## Implementation Details

### Files Modified/Created

1. **`nodeConfigFields.ts`**: Utility defining field configurations
   - `DEFAULT_FIELDS`: Fields shown for all nodes
   - `AZURE_FIELDS`: Additional fields for Azure nodes
   - `getConfigFieldsForNodeType()`: Returns appropriate fields based on node type
   - `buildAzureResourceId()`: Builds Azure resource ID from field values

2. **`ConfigurationTab.tsx`**: Updated to use dynamic field rendering
   - Displays Azure badge for Azure nodes
   - Renders fields dynamically based on node type
   - Includes tooltips for field descriptions
   - Supports different input types (text, select, textarea, url)

3. **`DiagramCanvas.tsx`**: Updated node creation
   - Initializes Azure nodes with empty Azure field values
   - Maintains backward compatibility for non-Azure nodes

## Usage

### For Users
1. Create any node - it will show the default fields (Label, Status, Description)
2. Create an Azure node (any type starting with "azure-") - it will show:
   - Default fields (Label, Status, Description)
   - Additional Azure-specific fields with helpful tooltips
   - Blue "Azure Resource" badge
   - Required fields are marked with a red asterisk (*)
3. Create a Kubernetes node (any type starting with "k8s-") - it will show:
   - Default fields (Label, Status, Description)
   - Additional Kubernetes-specific fields with helpful tooltips
   - Green "Kubernetes Resource" badge
   - Required fields are marked with a red asterisk (*)
4. Create a Kafka node (any type starting with "kafka-") - it will show:
   - Default fields (Label, Status, Description)
   - Additional Kafka-specific fields with helpful tooltips
   - Orange "Kafka Resource" badge
   - Required fields are marked with a red asterisk (*)
5. Create a GCP node (Compute Engine, Cloud Storage, etc.) - it will show:
   - Default fields (Label, Status, Description)
   - Additional GCP-specific fields with helpful tooltips
   - Purple "Google Cloud Resource" badge
   - Required fields are marked with a red asterisk (*)

### For Developers
```typescript
// Get fields for a specific node type
import { getConfigFieldsForNodeType } from '@/utils/nodeConfigFields';

// Azure node
const azureFields = getConfigFieldsForNodeType('azure-function-app');
// Returns: DEFAULT_FIELDS + AZURE_FIELDS

// Kubernetes node
const k8sFields = getConfigFieldsForNodeType('k8s-pod');
// Returns: DEFAULT_FIELDS + KUBERNETES_FIELDS

// Kafka node  
const kafkaFields = getConfigFieldsForNodeType('kafka-cluster');
// Returns: DEFAULT_FIELDS + KAFKA_FIELDS

// GCP node
const gcpFields = getConfigFieldsForNodeType('compute-engine');
// Returns: DEFAULT_FIELDS + GCP_FIELDS

// Regular custom node
const customFields = getConfigFieldsForNodeType('custom-component');
// Returns: DEFAULT_FIELDS only

// Build resource identifiers
import { 
  buildAzureResourceId, 
  buildKubernetesResourceId, 
  buildKafkaResourceId,
  buildGCPResourceId
} from '@/utils/nodeConfigFields';

// Azure resource ID
const azureResourceId = buildAzureResourceId({
  subscriptionId: 'sub-123',
  resourceGroup: 'my-rg',
  resourceName: 'my-func'
}, 'azure-function-app');
// Returns: "/subscriptions/sub-123/resourceGroups/my-rg/providers/Microsoft.Web/sites/my-func"

// Kubernetes resource ID
const k8sResourceId = buildKubernetesResourceId({
  namespace: 'production',
  resourceName: 'nginx-pod',
  clusterName: 'prod-cluster'
}, 'k8s-pod');
// Returns: "prod-cluster/production/pods/nginx-pod"

// Kafka resource ID
const kafkaResourceId = buildKafkaResourceId({
  brokerList: 'broker1:9092,broker2:9092',
  topicName: 'user-events'
}, 'kafka-topic');
// Returns: "broker1:9092/user-events"

// GCP resource ID
const gcpResourceId = buildGCPResourceId({
  projectId: 'my-project',
  resourceName: 'web-server-instance',
  zone: 'us-central1-a'
}, 'compute-engine');
// Returns: "projects/my-project/zones/us-central1-a/instances/web-server-instance"
```

## Extensibility

The system is designed to be easily extensible:

1. **Add new node types**: Create new field arrays (e.g., `AWS_FIELDS`, `GCP_FIELDS`)
2. **Update field logic**: Modify `getConfigFieldsForNodeType()` to handle new node type patterns
3. **Add field types**: Extend the `ConfigField` interface and update the rendering logic in `ConfigurationTab`
4. **Add new cloud providers**: Follow the same pattern as Azure/Kubernetes/Kafka implementations

## Supported Resource Types

### Azure Resource Types
The system currently maps these Azure node types to their corresponding Azure resource provider types:

- `azure-function-app` → `Microsoft.Web/sites`
- `azure-service-bus` → `Microsoft.ServiceBus/namespaces`
- `azure-application-insights` → `Microsoft.Insights/components`
- `azure-virtual-network` → `Microsoft.Network/virtualNetworks`
- `azure-app-service` → `Microsoft.Web/sites`
- `azure-firewall` → `Microsoft.Network/azureFirewalls`
- `azure-application-gateway` → `Microsoft.Network/applicationGateways`
- `azure-key-vault` → `Microsoft.KeyVault/vaults`
- `azure-cosmos-db` → `Microsoft.DocumentDB/databaseAccounts`

### Kubernetes Resource Types
The system currently maps these Kubernetes node types to their corresponding Kubernetes resource types:

- `k8s-pod` → `pods`
- `k8s-service` → `services`
- `k8s-cronjob` → `cronjobs`

### Kafka Resource Types
The system currently supports these Kafka node types:

- `kafka-cluster` → Kafka cluster infrastructure
- `kafka-topic` → Kafka topic for data streaming

### Google Cloud Platform Resource Types
The system currently maps these GCP node types to their corresponding GCP resource types:

- `compute-engine` → `instances` (zonal)
- `cloud-storage` → `buckets` (global)
- `cloud-sql` → `instances` (regional)
- `kubernetes-engine` → `clusters` (zonal)
- `cloud-functions` → `functions` (regional)
- `cloud-run` → `services` (regional)
- `load-balancer` → `forwardingRules` (regional)
- `cloud-armor` → `securityPolicies` (global)
- `app-engine` → `services` (global)
- `vpc-network` → `networks` (global)

## Future Enhancements

- Add validation for field formats (Azure subscription ID format, Kubernetes resource name validation, etc.)
- Implement auto-completion for resource names and namespaces
- Add integration with cloud APIs for resource discovery
- Support for other cloud providers (AWS, GCP) with their specific fields
- Field groups and collapsible sections for better organization
- Real-time validation against actual resources
- Import/export of node configurations
- Template system for common configurations
