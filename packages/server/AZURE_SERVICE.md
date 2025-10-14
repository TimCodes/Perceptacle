# Azure Service Implementation

This implementation provides a comprehensive service for interacting with Azure resources, specifically designed to pull metrics and logs.

## Features

✅ **Resource Management**
- List Azure resources with filtering
- Get specific resource details
- Support for resource queries by type, location, resource group, and tags

✅ **Metrics Collection**
- Retrieve metrics for any Azure resource
- Get metric definitions and available aggregations
- Support for custom time ranges and intervals
- Multiple metric names in a single query

✅ **Log Analytics**
- Query logs using KQL (Kusto Query Language)
- Support for Log Analytics workspaces
- Structured log parsing with timestamps, levels, and properties

✅ **Diagnostic Settings**
- Retrieve diagnostic configuration for resources
- Monitor what logs and metrics are being collected

✅ **Service Bus Management**
- Get message counts for individual queues and topics
- Retrieve comprehensive namespace summary with all entities
- Monitor queue, topic, and subscription message statistics
- Get dead letter and scheduled message counts
- Track subscription counts per topic

## API Endpoints

### Resources
- `GET /api/azure/resources` - List all resources
- `GET /api/azure/resources/{resourceId}` - Get specific resource

### Metrics
- `GET /api/azure/resources/{resourceId}/metrics` - Get resource metrics
- `GET /api/azure/resources/{resourceId}/metric-definitions` - Get available metrics

### Logs
- `POST /api/azure/resources/{resourceId}/logs` - Query resource logs

### Diagnostics
- `GET /api/azure/resources/{resourceId}/diagnostic-settings` - Get diagnostic settings

### Service Bus
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/summary` - Get complete namespace summary
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/queues` - Get all queues
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/queues/{queueName}` - Get specific queue info
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/topics` - Get all topics
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/topics/{topicName}` - Get specific topic info
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/subscriptions` - Get all subscriptions
- `GET /api/azure/service-bus/{resourceGroupName}/{namespaceName}/topics/{topicName}/subscriptions/{subscriptionName}` - Get specific subscription info

## Setup

### Environment Variables

```bash
# Required
AZURE_SUBSCRIPTION_ID=your-subscription-id

# Option 1: Service Principal (for production)
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# Option 2: Use Default Azure Credentials (Azure CLI, Managed Identity, etc.)
# No additional variables needed - will use DefaultAzureCredential
```

### Installation

```bash
cd packages/server
npm install
```

### Running

```bash
npm run dev
```

## Usage Examples

### 1. Get Virtual Machine Metrics

```bash
curl -X GET \
  "http://localhost:3000/api/azure/resources/subscriptions/your-sub/resourceGroups/your-rg/providers/Microsoft.Compute/virtualMachines/your-vm/metrics?metricNames=Percentage%20CPU,Network%20In&timespan=PT1H&interval=PT5M&aggregation=Average"
```

### 2. Query Application Insights Logs

```bash
curl -X POST \
  "http://localhost:3000/api/azure/resources/subscriptions/your-sub/resourceGroups/your-rg/providers/Microsoft.Insights/components/your-ai/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "requests | where timestamp > ago(1h) | summarize count() by bin(timestamp, 5m)",
    "workspaceId": "your-workspace-id",
    "timespan": "PT1H"
  }'
```

### 3. List Resources by Type

```bash
curl -X GET \
  "http://localhost:3000/api/azure/resources?resourceType=Microsoft.Web/sites&location=eastus"
```

### 4. Get Available Metrics for a Resource

```bash
curl -X GET \
  "http://localhost:3000/api/azure/resources/subscriptions/your-sub/resourceGroups/your-rg/providers/Microsoft.Web/sites/your-webapp/metric-definitions"
```

### 5. Get Service Bus Namespace Summary

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/your-rg/your-namespace/summary"
```

### 6. Get Service Bus Queue Message Counts

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/your-rg/your-namespace/queues/your-queue"
```

### 7. Get Service Bus Topic Information

```bash
curl -X GET \
  "http://localhost:3000/api/azure/service-bus/your-rg/your-namespace/topics/your-topic"
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │────│  Express API    │────│  Azure Service  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                              ┌─────────────────────────┼─────────────────────────┐
                              │                         │                         │
                    ┌─────────▼──────────┐    ┌─────────▼──────────┐    ┌─────────▼──────────┐
                    │ ResourceManagement │    │    MonitorClient   │    │  LogsQueryClient   │
                    │      Client        │    │                    │    │                    │
                    └────────────────────┘    └────────────────────┘    └────────────────────┘
                              │                         │                         │
                    ┌─────────▼──────────┐    ┌─────────▼──────────┐    ┌─────────▼──────────┐
                    │  Azure Resources   │    │  Azure Monitor     │    │ Log Analytics      │
                    │    Management      │    │   & Metrics        │    │   Workspaces       │
                    └────────────────────┘    └────────────────────┘    └────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ ServiceBusManagement│
                    │      Client        │
                    └────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │   Azure Service    │
                    │    Bus Namespaces  │
                    └────────────────────┘
```

## Error Handling

The service includes comprehensive error handling for:
- Authentication failures
- Invalid resource IDs
- Missing workspace IDs for log queries
- Network timeouts
- Azure API rate limits

## Security

- Uses Azure SDK's built-in authentication mechanisms
- Supports both service principal and managed identity authentication
- No credentials stored in code
- All environment variables are validated at startup

## Testing

```bash
npm test
```

Tests include:
- Service initialization with different credential types
- Method availability validation
- Error handling scenarios
- Parameter validation

## Development

To add new functionality:

1. Add new methods to `AzureService` class
2. Create corresponding API routes in `routes/azure.ts`
3. Add tests in `__tests__/azure.test.ts`
4. Update this documentation

## Troubleshooting

### Authentication Issues
- Ensure Azure CLI is logged in: `az login`
- Verify service principal permissions
- Check environment variables are set correctly

### Missing Metrics
- Verify the resource supports the requested metrics
- Check metric names spelling (case-sensitive)
- Ensure proper time range format (ISO 8601 duration)

### Log Query Failures
- Verify Log Analytics workspace ID is correct
- Check KQL query syntax
- Ensure workspace has data for the specified time range
