/**
 * AgentsService - HTTP client for communicating with the Python agents service
 */

export interface AgentHealthResponse {
    status: string;
    service: string;
    timestamp: string;
    environment: string;
}

export interface AgentStatusResponse {
    agents_available: boolean;
    message: string;
    features: {
        supervisor_agent: boolean;
        rag_integration: boolean;
        tool_execution: boolean;
    };
}

export interface ChatRequest {
    message: string;
    session_id?: string;
    context?: Record<string, any>;
}

export interface ChatResponse {
    response: string;
    session_id: string;
}

export class AgentsService {
    private baseUrl: string;
    private timeout: number;

    constructor() {
        // Default to Docker service name, fallback to localhost for local dev
        this.baseUrl = process.env.AGENTS_SERVICE_URL || 'http://agents:8000';
        this.timeout = 30000; // 30 seconds
    }

    /**
     * Check if the agents service is healthy
     */
    async checkHealth(): Promise<AgentHealthResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to connect to agents service: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Get the status of available agents
     */
    async getAgentStatus(): Promise<AgentStatusResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/agents/status`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                throw new Error(`Agent status check failed: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get agent status: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Send a chat message to the agent (placeholder for Feature 1.3)
     * This will be implemented when the LangGraph supervisor agent is created.
     */
    async chat(request: ChatRequest): Promise<ChatResponse> {
        try {
            const response = await fetch(`${this.baseUrl}/api/agents/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
                signal: AbortSignal.timeout(this.timeout),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Chat request failed: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to send chat message: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Check if the agents service is reachable
     */
    async isAvailable(): Promise<boolean> {
        try {
            await this.checkHealth();
            return true;
        } catch {
            return false;
        }
    }
}

export const agentsService = new AgentsService();
