/**
 * Mock RAG Service - Simulates RAG service for development and testing
 * 
 * This mock service provides realistic responses without requiring an actual RAG service,
 * useful for local development and testing.
 */

import type {
    RagCredentials,
    RagQueryParams,
    RagQueryResponse,
    RagRetrievalParams,
    RagRetrievalResponse,
    RagDocument,
    RagHealthResponse,
    RagIndexStats
} from './rag';

export class MockRagService {
    private mockDocuments: RagDocument[];
    private baseUrl: string;
    private credentials?: RagCredentials;

    constructor(baseUrl?: string, credentials?: RagCredentials) {
        this.baseUrl = baseUrl || 'http://mock-rag-service:8080';
        this.credentials = credentials;
        this.mockDocuments = this.generateMockDocuments();
    }

    /**
     * Create mock RAG service instance from environment variables
     */
    static fromEnvironment(): MockRagService {
        return new MockRagService();
    }

    /**
     * Mock query implementation
     */
    async query(params: RagQueryParams): Promise<RagQueryResponse> {
        // Simulate network delay
        await this.delay(100, 300);

        // Filter documents based on query (simple keyword matching)
        const queryLower = params.query.toLowerCase();
        const relevantDocs = this.mockDocuments
            .map(doc => ({
                ...doc,
                score: this.calculateMockScore(doc, queryLower)
            }))
            .filter(doc => doc.score >= (params.threshold || 0.7))
            .sort((a, b) => b.score - a.score)
            .slice(0, params.topK || 5);

        return {
            documents: relevantDocs,
            query: params.query,
            totalResults: relevantDocs.length,
            processingTime: Math.random() * 200 + 50
        };
    }

    /**
     * Mock retrieve implementation
     */
    async retrieve(params: RagRetrievalParams): Promise<RagRetrievalResponse> {
        // Simulate network delay
        await this.delay(50, 150);

        const found: RagDocument[] = [];
        const notFound: string[] = [];

        for (const id of params.documentIds) {
            const doc = this.mockDocuments.find(d => d.id === id);
            if (doc) {
                found.push(doc);
            } else {
                notFound.push(id);
            }
        }

        return {
            documents: found,
            notFound: notFound.length > 0 ? notFound : undefined
        };
    }

    /**
     * Mock search implementation
     */
    async search(query: string, options?: Partial<RagQueryParams>): Promise<RagDocument[]> {
        const response = await this.query({
            query,
            ...options
        });
        return response.documents;
    }

    /**
     * Mock health check
     */
    async checkHealth(): Promise<RagHealthResponse> {
        await this.delay(10, 50);

        return {
            status: 'healthy',
            service: 'mock-rag-service',
            timestamp: new Date().toISOString(),
            version: '1.0.0-mock'
        };
    }

    /**
     * Mock index stats
     */
    async getIndexStats(): Promise<RagIndexStats> {
        await this.delay(50, 100);

        return {
            totalDocuments: this.mockDocuments.length,
            namespaces: ['default', 'documentation', 'logs', 'troubleshooting'],
            lastUpdated: new Date(Date.now() - 3600000), // 1 hour ago
            indexSize: this.mockDocuments.length * 1024 // Mock size in bytes
        };
    }

    /**
     * Mock availability check
     */
    async isAvailable(): Promise<boolean> {
        return true;
    }

    /**
     * Generate mock documents for testing
     */
    private generateMockDocuments(): RagDocument[] {
        return [
            {
                id: 'doc-001',
                content: 'Kubernetes pod troubleshooting guide: When a pod is in CrashLoopBackOff state, check the container logs using kubectl logs command. Common causes include missing environment variables, incorrect configuration, or application errors.',
                metadata: {
                    source: 'kubernetes-docs',
                    category: 'troubleshooting',
                    tags: ['kubernetes', 'pods', 'debugging']
                },
                score: 0.95,
                source: 'documentation/kubernetes/troubleshooting.md',
                timestamp: new Date('2024-01-15')
            },
            {
                id: 'doc-002',
                content: 'Azure Service Bus dead letter queue handling: Messages end up in the dead letter queue when they exceed max delivery count or TTL expires. To process dead letter messages, use the ServiceBusReceiver with the dead letter queue path.',
                metadata: {
                    source: 'azure-docs',
                    category: 'messaging',
                    tags: ['azure', 'service-bus', 'dead-letter']
                },
                score: 0.92,
                source: 'documentation/azure/service-bus.md',
                timestamp: new Date('2024-01-20')
            },
            {
                id: 'doc-003',
                content: 'MongoDB slow query optimization: Use explain() to analyze query performance. Create appropriate indexes on frequently queried fields. Consider using compound indexes for queries with multiple conditions.',
                metadata: {
                    source: 'mongodb-docs',
                    category: 'performance',
                    tags: ['mongodb', 'optimization', 'indexes']
                },
                score: 0.88,
                source: 'documentation/mongodb/performance.md',
                timestamp: new Date('2024-02-01')
            },
            {
                id: 'doc-004',
                content: 'GitHub Actions workflow debugging: Enable debug logging by setting secrets ACTIONS_STEP_DEBUG and ACTIONS_RUNNER_DEBUG to true. Check workflow run logs for detailed execution information.',
                metadata: {
                    source: 'github-docs',
                    category: 'ci-cd',
                    tags: ['github', 'actions', 'debugging']
                },
                score: 0.85,
                source: 'documentation/github/actions.md',
                timestamp: new Date('2024-02-10')
            },
            {
                id: 'doc-005',
                content: 'Oracle Cloud compute instance connectivity issues: Verify security list rules allow ingress traffic on required ports. Check subnet route tables and network security groups. Ensure instance has public IP if accessing from internet.',
                metadata: {
                    source: 'oracle-docs',
                    category: 'networking',
                    tags: ['oracle', 'compute', 'networking']
                },
                score: 0.83,
                source: 'documentation/oracle/networking.md',
                timestamp: new Date('2024-02-15')
            },
            {
                id: 'doc-006',
                content: 'Application error: Connection timeout to database. Root cause: Database connection pool exhausted. Solution: Increase max pool size in configuration or optimize query performance to reduce connection hold time.',
                metadata: {
                    source: 'incident-logs',
                    category: 'incident',
                    tags: ['database', 'timeout', 'connection-pool'],
                    severity: 'high',
                    resolved: true
                },
                score: 0.90,
                source: 'logs/incidents/2024-02-20-db-timeout.log',
                timestamp: new Date('2024-02-20')
            },
            {
                id: 'doc-007',
                content: 'Memory leak detected in Node.js service. Investigation revealed unclosed event listeners in WebSocket connections. Fix: Properly clean up listeners on connection close using removeListener or once() method.',
                metadata: {
                    source: 'incident-logs',
                    category: 'incident',
                    tags: ['nodejs', 'memory-leak', 'websocket'],
                    severity: 'critical',
                    resolved: true
                },
                score: 0.87,
                source: 'logs/incidents/2024-02-25-memory-leak.log',
                timestamp: new Date('2024-02-25')
            },
            {
                id: 'doc-008',
                content: 'Kafka consumer lag troubleshooting: High consumer lag indicates consumers cannot keep up with producer rate. Solutions: Increase number of consumer instances, optimize message processing logic, or increase partition count for better parallelism.',
                metadata: {
                    source: 'kafka-docs',
                    category: 'troubleshooting',
                    tags: ['kafka', 'consumer', 'performance']
                },
                score: 0.84,
                source: 'documentation/kafka/consumer-lag.md',
                timestamp: new Date('2024-03-01')
            },
            {
                id: 'doc-009',
                content: 'Docker container health check best practices: Implement health check endpoints that verify critical dependencies. Use HEALTHCHECK instruction in Dockerfile. Set appropriate intervals and timeouts based on application startup time.',
                metadata: {
                    source: 'docker-docs',
                    category: 'best-practices',
                    tags: ['docker', 'health-check', 'containers']
                },
                score: 0.81,
                source: 'documentation/docker/health-checks.md',
                timestamp: new Date('2024-03-05')
            },
            {
                id: 'doc-010',
                content: 'API rate limiting implementation: Use token bucket or sliding window algorithms. Store rate limit counters in Redis for distributed systems. Return 429 status code with Retry-After header when limit exceeded.',
                metadata: {
                    source: 'api-docs',
                    category: 'best-practices',
                    tags: ['api', 'rate-limiting', 'redis']
                },
                score: 0.79,
                source: 'documentation/api/rate-limiting.md',
                timestamp: new Date('2024-03-10')
            },
            {
                id: 'doc-011',
                content: 'Microservices circuit breaker pattern: Prevent cascading failures by failing fast when downstream service is unhealthy. Implement using libraries like resilience4j or Hystrix. Configure failure threshold, timeout, and recovery time.',
                metadata: {
                    source: 'architecture-docs',
                    category: 'patterns',
                    tags: ['microservices', 'circuit-breaker', 'resilience']
                },
                score: 0.86,
                source: 'documentation/architecture/circuit-breaker.md',
                timestamp: new Date('2024-03-15')
            },
            {
                id: 'doc-012',
                content: 'Log aggregation with ELK stack: Configure Filebeat to ship logs from application servers to Logstash. Use Logstash filters to parse and enrich log data. Store in Elasticsearch and visualize with Kibana dashboards.',
                metadata: {
                    source: 'logging-docs',
                    category: 'observability',
                    tags: ['elk', 'logging', 'monitoring']
                },
                score: 0.82,
                source: 'documentation/logging/elk-stack.md',
                timestamp: new Date('2024-03-20')
            }
        ];
    }

    /**
     * Calculate mock relevance score based on keyword matching
     */
    private calculateMockScore(doc: RagDocument, query: string): number {
        const contentLower = doc.content.toLowerCase();
        const words = query.split(/\s+/).filter(w => w.length > 2);

        if (words.length === 0) return 0.5;

        let matches = 0;
        for (const word of words) {
            if (contentLower.includes(word)) {
                matches++;
            }
        }

        // Base score on percentage of query words found
        const baseScore = matches / words.length;

        // Add some randomness to make it more realistic
        const randomFactor = 0.9 + Math.random() * 0.1;

        return Math.min(baseScore * randomFactor, 1.0);
    }

    /**
     * Simulate network delay
     */
    private delay(min: number, max: number): Promise<void> {
        const ms = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default MockRagService;
