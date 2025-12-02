/**
 * RAG Service - Client for communicating with external RAG (Retrieval-Augmented Generation) service
 * 
 * This service provides integration with an external RAG service via REST API,
 * enabling context-aware AI responses using documentation and historical logs.
 */

// Types for the RAG service
export interface RagCredentials {
  apiKey?: string;
  bearerToken?: string;
  customHeaders?: Record<string, string>;
}

export interface RagQueryParams {
  query: string;
  topK?: number;
  threshold?: number;
  filters?: Record<string, any>;
  namespace?: string;
}

export interface RagDocument {
  id: string;
  content: string;
  metadata: Record<string, any>;
  score: number;
  source?: string;
  timestamp?: Date;
}

export interface RagQueryResponse {
  documents: RagDocument[];
  query: string;
  totalResults: number;
  processingTime?: number;
}

export interface RagRetrievalParams {
  documentIds: string[];
  namespace?: string;
}

export interface RagRetrievalResponse {
  documents: RagDocument[];
  notFound?: string[];
}

export interface RagHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  version?: string;
}

export interface RagIndexStats {
  totalDocuments: number;
  namespaces?: string[];
  lastUpdated?: Date;
  indexSize?: number;
}

export class RagService {
  private baseUrl: string;
  private credentials?: RagCredentials;
  private timeout: number;

  constructor(baseUrl?: string, credentials?: RagCredentials) {
    this.baseUrl = baseUrl || process.env.RAG_SERVICE_URL || 'http://rag-service:8080';
    this.credentials = credentials;
    this.timeout = parseInt(process.env.RAG_SERVICE_TIMEOUT || '30000', 10);
  }

  /**
   * Create RAG service instance from environment variables
   */
  static fromEnvironment(): RagService {
    const credentials: RagCredentials = {};
    
    if (process.env.RAG_SERVICE_API_KEY) {
      credentials.apiKey = process.env.RAG_SERVICE_API_KEY;
    }
    
    if (process.env.RAG_SERVICE_BEARER_TOKEN) {
      credentials.bearerToken = process.env.RAG_SERVICE_BEARER_TOKEN;
    }

    return new RagService(process.env.RAG_SERVICE_URL, credentials);
  }

  /**
   * Query the RAG service for relevant documents
   */
  async query(params: RagQueryParams): Promise<RagQueryResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/query`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          query: params.query,
          top_k: params.topK || 5,
          threshold: params.threshold || 0.7,
          filters: params.filters,
          namespace: params.namespace
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `RAG query failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      return {
        documents: (data.documents || data.results || []).map((doc: any) => this.normalizeDocument(doc)),
        query: params.query,
        totalResults: data.total_results || data.totalResults || data.documents?.length || 0,
        processingTime: data.processing_time || data.processingTime
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to query RAG service: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Retrieve specific documents by ID
   */
  async retrieve(params: RagRetrievalParams): Promise<RagRetrievalResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/retrieve`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({
          document_ids: params.documentIds,
          namespace: params.namespace
        }),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `RAG retrieval failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      return {
        documents: (data.documents || []).map((doc: any) => this.normalizeDocument(doc)),
        notFound: data.not_found || data.notFound
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to retrieve documents from RAG service: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for documents with semantic similarity
   */
  async search(query: string, options?: Partial<RagQueryParams>): Promise<RagDocument[]> {
    const response = await this.query({
      query,
      ...options
    });
    return response.documents;
  }

  /**
   * Get health status of the RAG service
   */
  async checkHealth(): Promise<RagHealthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`RAG health check failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to check RAG service health: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Get index statistics
   */
  async getIndexStats(): Promise<RagIndexStats> {
    try {
      const response = await fetch(`${this.baseUrl}/api/stats`, {
        method: 'GET',
        headers: this.buildHeaders(),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || errorData.message || `Failed to get index stats: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      
      return {
        totalDocuments: data.total_documents || data.totalDocuments || 0,
        namespaces: data.namespaces,
        lastUpdated: data.last_updated ? new Date(data.last_updated) : undefined,
        indexSize: data.index_size || data.indexSize
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get RAG index stats: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Check if the RAG service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.checkHealth();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Build HTTP headers for requests
   */
  private buildHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.credentials?.apiKey) {
      headers['X-API-Key'] = this.credentials.apiKey;
    }

    if (this.credentials?.bearerToken) {
      headers['Authorization'] = `Bearer ${this.credentials.bearerToken}`;
    }

    if (this.credentials?.customHeaders) {
      Object.assign(headers, this.credentials.customHeaders);
    }

    return headers;
  }

  /**
   * Normalize document format from various RAG service response formats
   */
  private normalizeDocument(doc: any): RagDocument {
    return {
      id: doc.id || doc.document_id || doc.doc_id,
      content: doc.content || doc.text || doc.document || '',
      metadata: doc.metadata || doc.meta || {},
      score: doc.score || doc.similarity || doc.relevance || 0,
      source: doc.source || doc.metadata?.source,
      timestamp: doc.timestamp ? new Date(doc.timestamp) : undefined
    };
  }
}

export default RagService;
