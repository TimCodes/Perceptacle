# service-factory.ts

**Path**: `packages/server/services/service-factory.ts`

## Overview

Centralized factory for creating and managing service instances with support for both real and mock implementations. Implements the Factory and Singleton patterns to provide consistent service instantiation throughout the application.

### Purpose
- Create service instances based on environment configuration
- Toggle between real and mock implementations
- Manage service credentials and configuration
- Provide type-safe service access
- Enable dependency injection for testing

### Dependencies
- All service classes (Kubernetes, Azure, GitHub, Oracle, MongoDB, Kafka, RAG, AIChat)
- All mock service classes
- `@azure/identity` - Azure authentication

### Exports
- `ServiceFactory` - Main factory class
- `ServiceFactoryConfig` - Configuration interface
- `createServiceFactoryFromEnv()` - Environment-based factory creator
- `serviceFactory` - Default singleton instance
- Type guard functions for all services

---

## Configuration Interface

### `ServiceFactoryConfig`
[Source](../../../../packages/server/services/service-factory.ts#L20-L51)

**Description**:  
Configuration object for ServiceFactory defining which services to use (real vs mock) and their credentials.

**Properties**:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `useMocks` | `boolean` | Yes | Whether to use mock services |
| `azure` | `object` | No | Azure configuration |
| `azure.subscriptionId` | `string` | Yes (if using Azure) | Azure subscription ID |
| `azure.serviceBusNamespace` | `string` | No | Service Bus namespace |
| `azure.credentials` | `AzureCredentials` | No | Service principal credentials |
| `kubernetes` | `KubernetesConfig` | No | Kubernetes configuration |
| `kubernetes.kubeconfig` | `string` | No | Path to kubeconfig file |
| `kubernetes.context` | `string` | No | K8s context name |
| `github` | `object` | No | GitHub configuration |
| `github.token` | `string` | Yes (if using GitHub) | Personal access token |
| `oracle` | `object` | No | Oracle configuration |
| `oracle.credentials` | `OracleCredentials` | No | Oracle cloud credentials |
| `kafka` | `object` | No | Kafka configuration |
| `kafka.clientId` | `string` | Yes | Kafka client identifier |
| `kafka.brokers` | `string[]` | Yes | Broker addresses |
| `aichat` | `object` | No | AI Chat configuration |
| `aichat.openaiApiKey` | `string` | No | OpenAI API key |
| `aichat.anthropicApiKey` | `string` | No | Anthropic API key |
| `aichat.geminiApiKey` | `string` | No | Google Gemini API key |
| `aichat.deepseekApiKey` | `string` | No | DeepSeek API key |
| `mongodb` | `object` | No | MongoDB configuration |
| `mongodb.credentials` | `MongoDBCredentials` | No | MongoDB connection details |
| `rag` | `object` | No | RAG service configuration |
| `rag.baseUrl` | `string` | No | RAG service URL |
| `rag.credentials` | `RagCredentials` | No | RAG API credentials |

---

## ServiceFactory Class

### Constructor

```typescript
constructor(config: ServiceFactoryConfig)
```

**Description**:  
Creates a new ServiceFactory instance with the provided configuration.

**Parameters**:
- `config: ServiceFactoryConfig` - Factory configuration

**Example**:
```typescript
const factory = new ServiceFactory({
  useMocks: true,
  github: { token: 'ghp_...' }
});
```

---

## Factory Methods

### `createKubernetesService()`
[Source](../../../../packages/server/services/service-factory.ts#L63-L81)

**Description**:  
Creates a Kubernetes service instance (real or mock) based on configuration.

**Returns**: `KubernetesService | MockKubernetesService`

**Behavior**:
- If `useMocks` is true, returns `MockKubernetesService`
- If kubeconfig provided, uses it for authentication
- Otherwise, uses default in-cluster or ~/.kube/config

**Error Cases**:
- Kubeconfig file not found (real service)
- Invalid kubeconfig format

**Example**:
```typescript
const k8sService = factory.createKubernetesService();
const pods = await k8sService.listPods('default');
```

**Called By**:
- [kubernetes.ts (routes)](../../routes/kubernetes.md)

---

### `createAzureService()`
[Source](../../../../packages/server/services/service-factory.ts#L86-L112)

**Description**:  
Creates an Azure service instance with Service Bus support.

**Returns**: `AzureService | MockAzureService`

**Error Cases**:
- Throws error if `subscriptionId` is missing

**Authentication Options**:
1. **Service Principal**: Provide clientId, clientSecret, tenantId
2. **Default Credentials**: Uses environment variables or managed identity

**Example**:
```typescript
const azureService = factory.createAzureService();
await azureService.sendMessage('my-queue', { data: 'Hello' });
```

**Called By**:
- [azure.ts (routes)](../../routes/azure.md)

---

### `createGitHubService()`
[Source](../../../../packages/server/services/service-factory.ts#L117-L131)

**Description**:  
Creates a GitHub service instance for repository operations.

**Returns**: `GitHubService | MockGitHubService`

**Error Cases**:
- Throws error if GitHub token is missing

**Token Requirements**:
- Personal Access Token with appropriate scopes:
  - `repo` for repository access
  - `workflow` for Actions access
  - `read:org` for organization data

**Example**:
```typescript
const githubService = factory.createGitHubService();
const prs = await githubService.getPullRequests({ owner: 'facebook', repo: 'react' });
```

**Called By**:
- [github.ts (routes)](../../routes/github.md)

---

### `createOracleService()`
[Source](../../../../packages/server/services/service-factory.ts#L136-L148)

**Description**:  
Creates an Oracle Cloud service instance.

**Returns**: `OracleService | MockOracleService`

**Error Cases**:
- Throws error if Oracle credentials are missing

**Credentials Required**:
- Tenancy OCID
- User OCID
- Fingerprint
- Private key
- Region

**Example**:
```typescript
const oracleService = factory.createOracleService();
const instances = await oracleService.listComputeInstances();
```

**Called By**:
- [oracle.ts (routes)](../../routes/oracle.md)

---

### `createAIChatService()`
[Source](../../../../packages/server/services/service-factory.ts#L153-L166)

**Description**:  
Creates an AI chat service supporting multiple LLM providers.

**Returns**: `AIChatService | MockAIChatService`

**Supported Providers**:
- OpenAI (GPT-3.5, GPT-4)
- Anthropic (Claude)
- Google (Gemini)
- DeepSeek

**Example**:
```typescript
const aiService = factory.createAIChatService();
const response = await aiService.chat([
  { role: 'user', content: 'Explain Kubernetes pods' }
]);
```

**Called By**:
- AI-powered features throughout application

---

### `createMongoDBService()`
[Source](../../../../packages/server/services/service-factory.ts#L171-L183)

**Description**:  
Creates a MongoDB service instance for NoSQL database operations.

**Returns**: `MongoDBService | MockMongoDBService`

**Error Cases**:
- Throws error if MongoDB credentials are missing

**Credentials Required**:
- Connection string (mongodb://)
- Database name

**Example**:
```typescript
const mongoService = factory.createMongoDBService();
const docs = await mongoService.find('users', { active: true });
```

**Called By**:
- [mongodb.ts (routes)](../../routes/mongodb.md)

---

### `createRagService()`
[Source](../../../../packages/server/services/service-factory.ts#L188-L197)

**Description**:  
Creates a RAG (Retrieval Augmented Generation) service for AI-powered queries.

**Returns**: `RagService | MockRagService`

**Configuration**:
- Base URL (optional): Custom RAG service endpoint
- Credentials (optional): API key for authentication

**Example**:
```typescript
const ragService = factory.createRagService();
const answer = await ragService.query('How to scale this deployment?', context);
```

**Called By**:
- [rag.ts (routes)](../../routes/rag.md)

---

### `createKafkaService()`
[Source](../../../../packages/server/services/service-factory.ts#L202-L210)

**Description**:  
Creates a Kafka service instance for event streaming.

**Returns**: `KafkaService`

**Note**: No mock service for Kafka (uses localhost by default)

**Default Config**:
```typescript
{
  clientId: 'perceptacle-server',
  brokers: ['localhost:9092']
}
```

**Example**:
```typescript
const kafkaService = factory.createKafkaService();
await kafkaService.sendMessage('events', { type: 'user.created' });
```

**Called By**:
- [kafka.ts (routes)](../../routes/kafka.md)

---

### `createHttpActionService()`
[Source](../../../../packages/server/services/service-factory.ts#L215-L217)

**Description**:  
Creates an HTTP action service for custom HTTP requests.

**Returns**: `HttpActionService`

**Note**: No configuration or mock needed

**Example**:
```typescript
const httpService = factory.createHttpActionService();
const response = await httpService.request({
  method: 'GET',
  url: 'https://api.example.com/health'
});
```

**Called By**:
- [http-action.ts (routes)](../../routes/http-action.md)

---

## Utility Methods

### `isUsingMocks()`
[Source](../../../../packages/server/services/service-factory.ts#L222-L224)

**Description**:  
Checks if factory is configured to use mock services.

**Returns**: `boolean` - True if using mocks

**Example**:
```typescript
if (factory.isUsingMocks()) {
  console.log('Running in mock mode');
}
```

---

### `getConfig()`
[Source](../../../../packages/server/services/service-factory.ts#L229-L231)

**Description**:  
Returns a copy of the current configuration.

**Returns**: `ServiceFactoryConfig` - Copy of configuration

**Note**: Returns copy to prevent external modifications

---

### `updateConfig(newConfig)`
[Source](../../../../packages/server/services/service-factory.ts#L236-L238)

**Description**:  
Updates the factory configuration by merging new values.

**Parameters**:
- `newConfig: Partial<ServiceFactoryConfig>` - Configuration updates

**Side Effects**:
- Merges new config with existing
- Does NOT recreate existing service instances

**Example**:
```typescript
factory.updateConfig({ useMocks: false });
```

---

## Helper Functions

### `createServiceFactoryFromEnv()`
[Source](../../../../packages/server/services/service-factory.ts#L242-L306)

**Description**:  
Creates a ServiceFactory instance from environment variables.

**Returns**: `ServiceFactory` - Configured factory instance

**Environment Variables**:

| Variable | Purpose | Default |
|----------|---------|---------|
| `USE_MOCK_SERVICES` | Enable mock mode | `true` in development |
| `AZURE_SUBSCRIPTION_ID` | Azure subscription | `'mock-subscription-id'` |
| `SERVICE_BUS_NAMESPACE` | Azure SB namespace | undefined |
| `AZURE_CLIENT_ID` | Service principal ID | undefined |
| `AZURE_CLIENT_SECRET` | Service principal secret | undefined |
| `AZURE_TENANT_ID` | Azure tenant | undefined |
| `KUBECONFIG` | Path to kubeconfig | undefined (uses default) |
| `KUBE_CONTEXT` | K8s context | undefined (uses current) |
| `GITHUB_TOKEN` | GitHub PAT | `'mock-github-token'` |
| `ORACLE_TENANCY` | Oracle tenancy OCID | Mock value |
| `ORACLE_USER` | Oracle user OCID | Mock value |
| `ORACLE_FINGERPRINT` | Key fingerprint | Mock value |
| `ORACLE_PRIVATE_KEY` | Private key | Mock value |
| `ORACLE_REGION` | Oracle region | `'us-phoenix-1'` |
| `KAFKA_BROKERS` | Comma-separated brokers | `'localhost:9092'` |
| `OPENAI_API_KEY` | OpenAI key | undefined |
| `ANTHROPIC_API_KEY` | Anthropic key | undefined |
| `GEMINI_API_KEY` | Google Gemini key | undefined |
| `DEEPSEEK_API_KEY` | DeepSeek key | undefined |
| `MONGODB_CONNECTION_STRING` | MongoDB URI | `'mongodb://localhost:27017'` |
| `MONGODB_DATABASE_NAME` | Database name | `'perceptacle'` |
| `RAG_SERVICE_URL` | RAG service URL | undefined |
| `RAG_SERVICE_API_KEY` | RAG API key | undefined |

**Mock Mode Logic**:
```typescript
useMocks = process.env.USE_MOCK_SERVICES === 'true' || 
           (process.env.NODE_ENV === 'development' && 
            process.env.USE_MOCK_SERVICES !== 'false')
```

**Example**:
```bash
# In .env file
USE_MOCK_SERVICES=false
GITHUB_TOKEN=ghp_yourtoken
OPENAI_API_KEY=sk-yourkey
```

```typescript
// In code
const factory = createServiceFactoryFromEnv();
const githubService = factory.createGitHubService(); // Real service
```

---

## Type Guards

Type guard functions enable TypeScript to narrow service types for type-safe operations.

### `isKubernetesService(service)`

**Description**: Checks if service is real KubernetesService

**Returns**: `service is KubernetesService`

**Example**:
```typescript
const service = factory.createKubernetesService();
if (isKubernetesService(service)) {
  // TypeScript knows service is real KubernetesService
  await service.performRealOperation();
}
```

### Other Type Guards

Similar type guards exist for:
- `isMockKubernetesService`
- `isAzureService` / `isMockAzureService`
- `isGitHubService` / `isMockGitHubService`
- `isOracleService` / `isMockOracleService`
- `isAIChatService` / `isMockAIChatService`
- `isMongoDBService` / `isMockMongoDBService`
- `isRagService` / `isMockRagService`
- `isKafkaService`

---

## Default Export

### `serviceFactory`
[Source](../../../../packages/server/services/service-factory.ts#L309)

**Description**:  
Default singleton factory instance created from environment variables.

**Usage**:
```typescript
import { serviceFactory } from './services/service-factory';

// Use directly without creating new instance
const k8sService = serviceFactory.createKubernetesService();
```

**Benefits**:
- Single configuration source
- Consistent service instances
- Easy to import and use

---

## Design Patterns

### Factory Pattern
Encapsulates object creation logic, allowing runtime selection of service implementations.

### Singleton Pattern (via default export)
Single `serviceFactory` instance ensures consistent configuration.

### Strategy Pattern
Swaps between real and mock implementations transparently.

### Dependency Injection
Services can be injected into routes for testing.

---

## Usage Examples

### Development with Mocks
```typescript
// .env.development
USE_MOCK_SERVICES=true

// Code automatically uses mocks
const factory = createServiceFactoryFromEnv();
const githubService = factory.createGitHubService(); // MockGitHubService
```

### Production with Real Services
```typescript
// .env.production
USE_MOCK_SERVICES=false
GITHUB_TOKEN=ghp_realtoken
OPENAI_API_KEY=sk_realkey

// Code uses real services
const factory = createServiceFactoryFromEnv();
const githubService = factory.createGitHubService(); // Real GitHubService
```

### Testing with Dependency Injection
```typescript
// test file
const mockFactory = new ServiceFactory({
  useMocks: true,
  github: { token: 'test-token' }
});

const githubService = mockFactory.createGitHubService();
// Use in route handlers for predictable tests
```

---

## Error Handling

### Common Errors

**Missing Required Credentials**:
```
Error: GitHub token is required
Error: Azure subscription ID is required
Error: Oracle credentials are required
Error: MongoDB credentials are required
```

**Solution**: Set required environment variables or provide in config

**Invalid Configuration**:
```
Error: Invalid kubeconfig format
Error: Invalid Azure credentials
```

**Solution**: Verify credential format and values

---

## Related Files

- [kubernetes.ts](./kubernetes.md) - Kubernetes service implementation
- [kubernetes.mock.ts](./kubernetes.mock.md) - Mock Kubernetes service
- [azure.ts](./azure.md) - Azure service implementation
- [github.ts](./github.md) - GitHub service implementation
- [rag.ts](./rag.md) - RAG service implementation
- [kubernetes.ts (routes)](../../routes/kubernetes.md) - Route using factory
- [github.ts (routes)](../../routes/github.md) - Route using factory
- [index.ts](./index.md) - Service exports

---

## Future Enhancements

1. **Service Caching**: Cache service instances instead of creating new ones
2. **Health Checks**: Add health check methods for all services
3. **Graceful Degradation**: Fallback to mocks if real service fails
4. **Service Discovery**: Auto-discover available services
5. **Metrics**: Track service usage and performance

---

**File Type**: TypeScript  
**Lines of Code**: 370  
**Services Supported**: 9  
**Type Guards**: 16  
**Last Updated**: January 2026
