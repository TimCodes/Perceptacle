# Mocked Services Implementation Summary

## Overview

I've successfully implemented comprehensive mock services for both Azure and Kubernetes APIs. These mock services provide realistic sample data for UI development and testing without requiring actual cloud resources.

## What Was Created

### 1. Mock Services

#### `kubernetes.mock.ts`
- **MockKubernetesService**: Complete mock implementation of the Kubernetes service
- **Features**:
  - Mock cluster information with 3 nodes (1 master, 2 workers)
  - Sample pods across different namespaces (app-frontend, app-backend, monitoring)
  - Realistic services with LoadBalancer, ClusterIP, and NodePort types
  - Mock deployments with replica status
  - Simulated pod metrics (CPU/memory usage)
  - Generated pod logs with timestamps and log levels
  - Namespace resource usage statistics
  - Configurable API delays to simulate real network latency

#### `azure.mock.ts`
- **MockAzureService**: Complete mock implementation of the Azure service
- **Features**:
  - Mock Azure resources (Web Apps, SQL Databases, Service Bus, Storage Accounts)
  - Resource filtering by resource group, location, type, and tags
  - Realistic metrics generation based on resource type
  - Mock Service Bus queues, topics, and subscriptions with message counts
  - Generated log entries with different severity levels
  - Diagnostic settings simulation
  - Resource-specific metric definitions

### 2. Service Factory

#### `service-factory.ts`
- **ServiceFactory**: Centralized factory for creating service instances
- **Features**:
  - Environment-based configuration
  - Easy switching between mock and real services
  - Support for Azure credentials and Kubernetes config
  - Type-safe service creation
  - Configuration validation

### 3. Integration Updates

#### Routes Updated
- `routes/azure.ts`: Updated to use service factory
- `routes/kubernetes.ts`: Updated to use service factory
- Both routes now automatically use mock or real services based on configuration

#### Configuration
- `.env.example`: Updated with mock service configuration options
- `USE_MOCK_SERVICES` environment variable for easy toggling
- Automatic mock enablement in development mode

### 4. Testing and Documentation

#### `test-mocked-services.ts`
- Comprehensive test script for all mock functionality
- Performance testing for concurrent requests
- Example usage patterns

#### Updated Documentation
- `services/README.md`: Enhanced with mock service information
- `services/index.ts`: Centralized exports for all services
- Environment variable documentation

## Environment Variables

```bash
# Enable mock services (automatically enabled in development)
USE_MOCK_SERVICES=true

# Required for Azure (even for mocks)
AZURE_SUBSCRIPTION_ID=your-subscription-id

# Optional Azure credentials (for real services)
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_TENANT_ID=your-tenant-id

# Optional Kubernetes config
KUBECONFIG=/path/to/kubeconfig
KUBE_CONTEXT=your-context
```

## Usage Examples

### Basic Usage
```typescript
import { serviceFactory } from './services/service-factory';

// Services are automatically mock or real based on configuration
const azureService = serviceFactory.createAzureService();
const k8sService = serviceFactory.createKubernetesService();

// Use them exactly like the real services
const resources = await azureService.listResources();
const pods = await k8sService.getPods();
```

### Custom Configuration
```typescript
import { ServiceFactory } from './services/service-factory';

const customFactory = new ServiceFactory({
  useMocks: true,
  azure: {
    subscriptionId: 'test-subscription'
  }
});

const mockAzureService = customFactory.createAzureService();
```

## Mock Data Features

### Azure Mock Data
- 6 realistic resources across different types
- Web Apps with health metrics
- SQL Database with performance metrics
- Service Bus with 4 queues and 3 topics
- Storage Account with usage metrics
- Application Insights monitoring
- Realistic Azure resource IDs and properties

### Kubernetes Mock Data
- 3-node cluster (1 master, 2 workers)
- 7 namespaces with different purposes
- 4 sample pods across different namespaces
- 4 services with different types
- 3 deployments with various configurations
- Real-time metrics simulation
- Multi-line log entries with timestamps

## Benefits

1. **Development Speed**: No need to set up real cloud resources
2. **Testing**: Consistent, predictable data for tests
3. **Offline Development**: Work without internet connectivity
4. **Cost Savings**: No cloud resource costs during development
5. **Demo Ready**: Rich sample data for demonstrations
6. **CI/CD Friendly**: Tests can run without external dependencies

## Testing

Run the test script to verify everything works:

```bash
npm run test:mocks
```

This will test all mock functionality and provide performance metrics.

## Next Steps

1. The mock services are now ready for UI development
2. Routes automatically use mocks when `USE_MOCK_SERVICES=true`
3. Switch to real services by setting `USE_MOCK_SERVICES=false` and providing credentials
4. All existing API endpoints work identically with mock data

The implementation is fully backward compatible and doesn't break any existing functionality while adding comprehensive mock capabilities.
