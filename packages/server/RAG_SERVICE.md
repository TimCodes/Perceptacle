# RAG Service Integration

## Overview

The RAG (Retrieval-Augmented Generation) Service integration enables the Synapse AI assistant to provide context-aware responses using documentation and historical logs. This integration connects to an external RAG service via REST API, allowing the system to search through knowledge bases, documentation, and incident logs to provide better troubleshooting assistance.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│                 │         │                  │         │                 │
│  Client UI      │────────▶│  Node.js Server  │────────▶│  External RAG   │
│  (React)        │         │  (Express)       │         │  Service        │
│                 │         │                  │         │                 │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                                     │
                                     ▼
                            ┌──────────────────┐
                            │                  │
                            │  Python Agents   │
                            │  (FastAPI)       │
                            │                  │
                            └──────────────────┘
                                     │
                                     │
                                     ▼
                            ┌──────────────────┐
                            │  RAG Service     │
                            │  (via HTTP)      │
                            └──────────────────┘
```

## Components

### 1. Backend Service (`packages/server/services/rag.ts`)

The `RagService` class provides a TypeScript client for communicating with the external RAG service.

**Key Features:**
- HTTP client using native `fetch` API
- Flexible authentication (API key, bearer token, custom headers)
- Configurable timeout settings
- Response normalization for different RAG service formats
- Error handling and retry logic

**Main Methods:**
- `query(params)` - Search for relevant documents
- `retrieve(params)` - Retrieve specific documents by ID
- `search(query, options)` - Simple search interface
- `checkHealth()` - Health check endpoint
- `getIndexStats()` - Get index statistics
- `isAvailable()` - Check service availability

### 2. Mock Service (`packages/server/services/rag.mock.ts`)

The `MockRagService` provides realistic mock data for development and testing without requiring an actual RAG service.

**Features:**
- 12 pre-populated mock documents covering various topics
- Simulated network delays
- Keyword-based relevance scoring
- Supports all RagService methods

**Mock Data Categories:**
- Kubernetes troubleshooting
- Azure Service Bus
- MongoDB optimization
- GitHub Actions
- Oracle Cloud networking
- Incident logs
- Architecture patterns
- Logging and monitoring

### 3. API Routes (`packages/server/routes/rag.ts`)

REST API endpoints for RAG operations:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/rag/query` | POST | Query for relevant documents |
| `/api/rag/retrieve` | POST | Retrieve documents by ID |
| `/api/rag/search` | POST | Simple search interface |
| `/api/rag/health` | GET | Health check |
| `/api/rag/stats` | GET | Index statistics |
| `/api/rag/status` | GET | Service availability |

### 4. Python RAG Client (`packages/agents/services/rag_client.py`)

Async Python client for the RAG service using `httpx`.

**Features:**
- Pydantic models for type safety
- Async/await support
- Response normalization
- Error handling

**Models:**
- `RagDocument` - Document structure
- `RagQueryParams` - Query parameters
- `RagQueryResponse` - Query response
- `RagRetrievalParams` - Retrieval parameters
- `RagRetrievalResponse` - Retrieval response
- `RagHealthResponse` - Health check response
- `RagIndexStats` - Index statistics

### 5. LangChain Tools (`packages/agents/tools/rag_tools.py`)

Three specialized tools for LangChain agents:

#### SearchDocumentationTool
- **Purpose:** Search through documentation and knowledge base
- **Use Case:** Finding configuration guides, best practices, troubleshooting steps
- **Filters:** Documentation category only

#### RetrieveContextTool
- **Purpose:** Retrieve relevant context from docs and logs
- **Use Case:** Getting background information, understanding issues
- **Filters:** Configurable (can include/exclude logs)

#### SearchIncidentLogsTool
- **Purpose:** Search historical incident logs
- **Use Case:** Finding similar past issues and their resolutions
- **Filters:** Incident category only

## Configuration

### Environment Variables

#### Root `.env`
```env
RAG_SERVICE_URL=http://rag-service:8080
RAG_SERVICE_API_KEY=your-rag-api-key
RAG_SERVICE_TIMEOUT=30000
```

#### Server `.env` (`packages/server/.env.example`)
```env
RAG_SERVICE_URL=http://rag-service:8080
RAG_SERVICE_API_KEY=your-rag-api-key
RAG_SERVICE_TIMEOUT=30000
```

#### Python Agents `.env` (`packages/agents/.env.example`)
```env
RAG_SERVICE_URL=http://rag-service:8080
RAG_SERVICE_API_KEY=your-rag-api-key
RAG_SERVICE_TIMEOUT=30000
```

### Using Mock Services

For development without a real RAG service:

```env
USE_MOCK_SERVICES=true
```

This will automatically use `MockRagService` instead of the real service.

## Usage Examples

### TypeScript (Node.js Server)

```typescript
import { RagService } from './services';

// Create service instance
const ragService = RagService.fromEnvironment();

// Query for documents
const response = await ragService.query({
  query: "How to troubleshoot Kubernetes pod crashes?",
  topK: 5,
  threshold: 0.7
});

console.log(`Found ${response.documents.length} relevant documents`);
response.documents.forEach(doc => {
  console.log(`- ${doc.source}: ${doc.content.substring(0, 100)}...`);
});

// Simple search
const docs = await ragService.search("MongoDB slow queries", {
  topK: 3,
  threshold: 0.75
});

// Check health
const health = await ragService.checkHealth();
console.log(`RAG service status: ${health.status}`);
```

### Python (Agents Service)

```python
from services.rag_client import get_rag_client, RagQueryParams

# Get client instance
rag_client = get_rag_client()

# Query for documents
params = RagQueryParams(
    query="Azure Service Bus dead letter queue",
    top_k=5,
    threshold=0.7
)
response = await rag_client.query(params)

for doc in response.documents:
    print(f"{doc.source}: {doc.content[:100]}...")

# Simple search
documents = await rag_client.search(
    query="Docker health checks",
    top_k=3
)

# Check availability
is_available = await rag_client.is_available()
print(f"RAG service available: {is_available}")
```

### Using RAG Tools with LangChain Agents

```python
from tools.rag_tools import get_rag_tools
from langchain.agents import AgentExecutor, create_openai_functions_agent

# Get RAG tools
rag_tools = get_rag_tools()

# Create agent with RAG tools
agent = create_openai_functions_agent(
    llm=llm,
    tools=rag_tools,
    prompt=prompt
)

executor = AgentExecutor(agent=agent, tools=rag_tools)

# Agent can now use RAG tools
result = await executor.ainvoke({
    "input": "How do I fix a Kubernetes pod that's in CrashLoopBackOff?"
})
```

### API Endpoints (REST)

```bash
# Query for documents
curl -X POST http://localhost:3000/api/rag/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Kafka consumer lag troubleshooting",
    "topK": 5,
    "threshold": 0.7
  }'

# Search (simple)
curl -X POST http://localhost:3000/api/rag/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "memory leak debugging",
    "topK": 3
  }'

# Health check
curl http://localhost:3000/api/rag/health

# Get statistics
curl http://localhost:3000/api/rag/stats

# Check status
curl http://localhost:3000/api/rag/status
```

## Authentication

The RAG service supports multiple authentication methods:

### API Key
```typescript
const ragService = new RagService('http://rag-service:8080', {
  apiKey: 'your-api-key'
});
```

### Bearer Token
```typescript
const ragService = new RagService('http://rag-service:8080', {
  bearerToken: 'your-bearer-token'
});
```

### Custom Headers
```typescript
const ragService = new RagService('http://rag-service:8080', {
  customHeaders: {
    'X-Custom-Auth': 'custom-value'
  }
});
```

## Error Handling

All RAG service methods include comprehensive error handling:

```typescript
try {
  const response = await ragService.query(params);
  // Process response
} catch (error) {
  if (error instanceof Error) {
    console.error('RAG query failed:', error.message);
    // Handle specific error cases
    if (error.message.includes('timeout')) {
      // Handle timeout
    } else if (error.message.includes('404')) {
      // Handle not found
    }
  }
}
```

## Response Normalization

The RAG service automatically normalizes responses from different RAG service formats:

```typescript
// Handles various response formats:
// - { documents: [...] } or { results: [...] }
// - { total_results: N } or { totalResults: N }
// - { processing_time: T } or { processingTime: T }

// Document fields normalized:
// - id / document_id / doc_id → id
// - content / text / document → content
// - score / similarity / relevance → score
```

## Testing

### Mock Service Testing

```typescript
import { MockRagService } from './services';

const mockRag = MockRagService.fromEnvironment();

// Test query
const response = await mockRag.query({
  query: "kubernetes troubleshooting",
  topK: 3
});

expect(response.documents.length).toBeGreaterThan(0);
expect(response.documents[0].score).toBeGreaterThan(0.7);
```

### Integration Testing

```bash
# Start services with mock RAG
USE_MOCK_SERVICES=true npm run dev

# Test endpoints
npm test -- rag.test.ts
npm test -- rag.routes.test.ts
```

## Troubleshooting

### RAG Service Not Available

**Symptom:** `Failed to connect to RAG service` errors

**Solutions:**
1. Check `RAG_SERVICE_URL` is correct
2. Verify RAG service is running
3. Check network connectivity
4. Use mock service for development: `USE_MOCK_SERVICES=true`

### Timeout Errors

**Symptom:** Requests timing out

**Solutions:**
1. Increase `RAG_SERVICE_TIMEOUT` value
2. Check RAG service performance
3. Reduce `topK` parameter to get faster responses

### No Results Returned

**Symptom:** Empty results for queries

**Solutions:**
1. Lower the `threshold` parameter (try 0.5-0.6)
2. Increase `topK` to get more results
3. Rephrase the query
4. Check if RAG index contains relevant documents

### Authentication Errors

**Symptom:** 401/403 errors

**Solutions:**
1. Verify `RAG_SERVICE_API_KEY` is correct
2. Check authentication method matches RAG service requirements
3. Ensure credentials are properly loaded from environment

## Performance Considerations

### Caching

Consider implementing caching for frequently queried documents:

```typescript
const cache = new Map<string, RagQueryResponse>();

async function cachedQuery(params: RagQueryParams) {
  const cacheKey = JSON.stringify(params);
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }
  
  const response = await ragService.query(params);
  cache.set(cacheKey, response);
  
  return response;
}
```

### Batch Requests

For multiple queries, consider batching:

```typescript
const queries = ['query1', 'query2', 'query3'];

const results = await Promise.all(
  queries.map(query => ragService.search(query, { topK: 3 }))
);
```

### Timeout Tuning

Adjust timeout based on your needs:
- **Fast responses (5-10s):** Simple queries, cached results
- **Medium (15-30s):** Complex queries, multiple namespaces
- **Long (30-60s):** Large result sets, heavy filtering

## Future Enhancements

Potential improvements for the RAG integration:

1. **Streaming Responses:** Support for streaming large result sets
2. **Advanced Filtering:** More sophisticated filtering options
3. **Semantic Caching:** Cache based on semantic similarity
4. **Multi-modal Search:** Support for images, diagrams
5. **Feedback Loop:** Learn from user interactions
6. **Custom Embeddings:** Support for domain-specific embeddings
7. **Hybrid Search:** Combine keyword and semantic search

## Related Documentation

- [Feature Breakdown](../../docs/feature_breakdown.md) - Story 1.2
- [Agents Service README](../agents/README.md) - Python agents integration
- [Service Factory](./services/service-factory.ts) - Service configuration

## Support

For issues or questions:
1. Check this documentation
2. Review error messages and logs
3. Test with mock service to isolate issues
4. Check RAG service documentation
5. Review implementation plan for design decisions
