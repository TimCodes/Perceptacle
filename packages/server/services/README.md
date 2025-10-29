# Perceptacle Services

This directory contains services for interacting with cloud infrastructure and orchestration platforms.

## Available Services

### Azure Service & Mock Azure Service

This service provides an API to interact with Azure resources, allowing you to retrieve metrics and logs from Azure Monitor and Log Analytics.

#### Features

- **Resource Management**: List and retrieve Azure resources
- **Metrics Collection**: Fetch metrics for Azure resources  
- **Log Querying**: Query logs using KQL (Kusto Query Language)
- **Metric Definitions**: Get available metrics for resources
- **Diagnostic Settings**: Retrieve diagnostic configuration
- **Service Bus Integration**: Monitor queues, topics, and subscriptions
- **Mock Implementation**: Full mock service for development and testing

### Kubernetes Service & Mock Kubernetes Service

This service provides a comprehensive API to interact with Kubernetes clusters, allowing you to retrieve logs, metrics, and cluster information.

#### Features

- **Cluster Management**: Get cluster info, nodes, and namespaces
- **Pod Operations**: List pods, get details, and retrieve logs
- **Service Discovery**: List services with endpoint information
- **Metrics Collection**: Real-time CPU and memory usage for pods
- **Deployment Monitoring**: Track deployment status and replica health
- **Resource Analytics**: Namespace-level resource usage summaries
- **Mock Implementation**: Full mock service for development and testing

### GitHub Service & Mock GitHub Service

This service provides a comprehensive API to interact with GitHub repositories, allowing you to retrieve pull requests, workflow runs, and repository information.

#### Features

- **Repository Management**: List and retrieve repository information
- **Pull Requests**: Get pull requests, comments, and reviews
- **Workflow Runs**: Monitor GitHub Actions workflow runs
- **Issues**: List and manage repository issues
- **Branches**: List and retrieve branch information
- **Mock Implementation**: Full mock service for development and testing

### Oracle Service & Mock Oracle Service

This service provides a comprehensive API to interact with Oracle Cloud Infrastructure (OCI) resources.

#### Features

- **Compartment Management**: List compartments in your tenancy
- **Compute Instances**: List and retrieve compute instance details
- **Block Storage**: Manage and monitor block volumes
- **Networking**: List Virtual Cloud Networks (VCNs) and networking resources
- **Database Systems**: Monitor Oracle database systems
- **Metrics Collection**: Retrieve performance metrics for resources
- **Mock Implementation**: Full mock service for development and testing

### Service Factory

The service factory provides a unified way to create and manage service instances, allowing easy switching between real and mock implementations.

#### Usage

```typescript
import { serviceFactory, createServiceFactoryFromEnv } from './service-factory';

// Use the default factory (configured from environment variables)
const kubernetesService = serviceFactory.createKubernetesService();
const azureService = serviceFactory.createAzureService();
const githubService = serviceFactory.createGitHubService();
const oracleService = serviceFactory.createOracleService();

// Create a custom factory
const customFactory = new ServiceFactory({
  useMocks: true,
  azure: {
    subscriptionId: 'your-subscription-id'
  }
});

const mockAzureService = customFactory.createAzureService();
```

#### Environment Variables

- `USE_MOCK_SERVICES`: Set to 'true' to use mock services
- `NODE_ENV`: When set to 'development', mock services are used by default
- `AZURE_SUBSCRIPTION_ID`: Azure subscription ID
- `AZURE_CLIENT_ID`: Azure service principal client ID
- `AZURE_CLIENT_SECRET`: Azure service principal secret
- `AZURE_TENANT_ID`: Azure tenant ID
- `KUBECONFIG`: Path to Kubernetes configuration file
- `KUBE_CONTEXT`: Kubernetes context to use
- `GITHUB_TOKEN`: GitHub personal access token
- `ORACLE_TENANCY`: Oracle Cloud tenancy OCID
- `ORACLE_USER`: Oracle Cloud user OCID
- `ORACLE_FINGERPRINT`: Oracle API key fingerprint
- `ORACLE_PRIVATE_KEY`: Oracle API private key
- `ORACLE_REGION`: Oracle Cloud region (e.g., us-phoenix-1)

## Mock Services

All services (Azure, Kubernetes, GitHub, and Oracle) have comprehensive mock implementations that:

- Return realistic sample data
- Simulate API response delays
- Support all the same methods as the real services
- Generate random but consistent metrics and logs
- Provide comprehensive test data for UI development

### Benefits of Mock Services

1. **Development**: No need for real cloud resources during development
2. **Testing**: Consistent, predictable data for testing
3. **Demos**: Rich sample data for demonstrations
4. **Offline Work**: Work without internet connectivity
5. **Cost Savings**: No cloud resource costs during development

## Quick Start

### Azure Service
```bash
curl "http://localhost:3000/api/azure/health"
curl "http://localhost:3000/api/azure/resources"
```

### Kubernetes Service  
```bash
curl "http://localhost:3000/api/kubernetes/health"
curl "http://localhost:3000/api/kubernetes/cluster"
curl "http://localhost:3000/api/kubernetes/pods"
```

### GitHub Service
```bash
curl "http://localhost:3000/api/github/health"
curl "http://localhost:3000/api/github/repos/owner/repo/pulls"
```

### Oracle Service
```bash
curl "http://localhost:3000/api/oracle/health"
curl "http://localhost:3000/api/oracle/compartments?tenancyId=ocid1.tenancy.oc1..aaaaaaaa123456789abcdef"
curl "http://localhost:3000/api/oracle/compute/instances?compartmentId=ocid1.compartment.oc1..aaaaaaaa123456789"
```

## Documentation

- **Azure Service**: See [AZURE_SERVICE.md](../AZURE_SERVICE.md) for detailed Azure service documentation
- **Kubernetes Service**: See [KUBERNETES_SERVICE.md](../KUBERNETES_SERVICE.md) for detailed Kubernetes service documentation

---

# Azure Proxy Service (Legacy Documentation)

This section contains the original Azure service documentation.

## Setup

### Prerequisites

1. Azure subscription with appropriate permissions
2. Service Principal or Azure CLI authentication
3. Log Analytics workspace (for log queries)

### Environment Variables

Copy `.env.example` to `.env` and configure the following:

```bash
# Required
AZURE_SUBSCRIPTION_ID=your-subscription-id
AZURE_CLIENT_ID=your-service-principal-client-id
AZURE_CLIENT_SECRET=your-service-principal-client-secret
AZURE_TENANT_ID=your-azure-tenant-id

# Optional (for log queries)
AZURE_LOG_ANALYTICS_WORKSPACE_ID=your-workspace-id
```

### Authentication Methods

The service supports multiple authentication methods in order of preference:

1. **Default Azure Credentials** (recommended for production)
   - Managed Identity (when deployed to Azure)
   - Azure CLI credentials (for local development)
   - Environment variables

2. **Service Principal Credentials**
   - Uses the environment variables above

## API Endpoints

### Health Check
```
GET /api/azure/health
```

### Resources
```
# List all resources
GET /api/azure/resources
Query parameters: resourceGroup, location, resourceType, tagName, tagValue

# Get specific resource
GET /api/azure/resources/{resourceId}
```

### Metrics
```
# Get metrics for a resource
GET /api/azure/resources/{resourceId}/metrics
Query parameters: timespan, interval, metricNames, aggregation

# Get available metric definitions
GET /api/azure/resources/{resourceId}/metric-definitions
```

### Logs
```
# Query logs for a resource
POST /api/azure/resources/{resourceId}/logs
Body: {
  "query": "KQL query string",
  "timespan": "PT1H",
  "workspaceId": "workspace-id"
}
```

### Diagnostic Settings
```
# Get diagnostic settings
GET /api/azure/resources/{resourceId}/diagnostic-settings
```

## Usage Examples

### Get VM CPU Metrics
```bash
curl "http://localhost:5000/api/azure/resources/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.Compute/virtualMachines/{vm-name}/metrics?metricNames=Percentage%20CPU&timespan=PT1H"
```

### Query Application Logs
```bash
curl -X POST "http://localhost:5000/api/azure/resources/{resource-id}/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "AzureActivity | where TimeGenerated > ago(1h) | limit 10",
    "timespan": "PT1H",
    "workspaceId": "your-workspace-id"
  }'
```

### Get Available Metrics
```bash
curl "http://localhost:5000/api/azure/resources/{resource-id}/metric-definitions"
```

## Common KQL Queries

### Application Insights
```kusto
requests 
| where timestamp > ago(1h)
| summarize count() by bin(timestamp, 5m)
```

### Activity Logs
```kusto
AzureActivity
| where TimeGenerated > ago(24h)
| where Level == "Error"
| project TimeGenerated, Caller, OperationName, ActivityStatus
```

### Performance Counters
```kusto
Perf
| where TimeGenerated > ago(1h)
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| summarize avg(CounterValue) by bin(TimeGenerated, 5m)
```

## Error Handling

The API returns structured error responses:

```json
{
  "error": "Description of the error",
  "details": "Additional error details"
}
```

Common error scenarios:
- Missing Azure credentials (500)
- Invalid resource ID (400)
- Resource not found (404)
- Permission denied (403)

## Permissions Required

The service principal needs the following Azure RBAC roles:

- **Reader**: To list and read resources
- **Monitoring Reader**: To read metrics and diagnostic settings
- **Log Analytics Reader**: To query logs (on the workspace)

## Development

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`

3. Start the development server:
   ```bash
   npm run dev
   ```

### Testing

Test the health endpoint:
```bash
curl http://localhost:5000/api/azure/health
```

## Troubleshooting

### Authentication Issues
- Ensure service principal has proper permissions
- Check that environment variables are set correctly
- For local development, try `az login` for Azure CLI authentication

### Log Query Issues
- Verify the Log Analytics workspace ID is correct
- Ensure the workspace has data
- Test KQL queries in the Azure portal first

### Permission Errors
- Check Azure RBAC assignments
- Verify subscription ID is correct
- Ensure service principal is not expired
