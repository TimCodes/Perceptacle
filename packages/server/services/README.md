# Azure Proxy Service

This service provides an API to interact with Azure resources, allowing you to retrieve metrics and logs from Azure Monitor and Log Analytics.

## Features

- **Resource Management**: List and retrieve Azure resources
- **Metrics Collection**: Fetch metrics for Azure resources
- **Log Querying**: Query logs using KQL (Kusto Query Language)
- **Metric Definitions**: Get available metrics for resources
- **Diagnostic Settings**: Retrieve diagnostic configuration

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
