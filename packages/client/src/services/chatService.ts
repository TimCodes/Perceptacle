import { ChatSession, ChatMessage, SendMessageResponse } from '@/types/chat';

const API_BASE = '/api/agents';

export class ChatService {
    /**
     * Get recent chat sessions
     */
    static async getSessions(): Promise<ChatSession[]> {
        const response = await fetch(`${API_BASE}/sessions`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch sessions');
        }

        return response.json();
    }

    /**
     * Create a new session
     */
    static async createSession(title: string): Promise<ChatSession> {
        const response = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to create session');
        }

        return response.json();
    }

    /**
     * Get history for a session
     */
    static async getHistory(sessionId: string): Promise<ChatMessage[]> {
        const response = await fetch(`${API_BASE}/history/${sessionId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch history');
        }

        return response.json();
    }

    /**
     * Send a message
     */
    static async sendMessage(message: string, sessionId?: string, context?: any): Promise<SendMessageResponse> {
        const response = await fetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                session_id: sessionId,
                context
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to send message');
        }

        return response.json();
    }

    /**
     * Stream a message
     */
    static async streamMessage(
        message: string,
        sessionId: string | undefined,
        onChunk: (event: { type: string; data?: string; session_id?: string; tool?: string }) => void,
        context?: any
    ): Promise<void> {
        const response = await fetch(`${API_BASE}/chat/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                session_id: sessionId,
                context
            }),
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to start stream');
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error('No reader available');

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim();
                    if (dataStr && dataStr !== '[DONE]') {
                        try {
                            const data = JSON.parse(dataStr);
                            onChunk(data);
                        } catch (e) {
                            console.error('Error parsing SSE chunk:', e);
                        }
                    }
                }
            }
        }
    }
}
