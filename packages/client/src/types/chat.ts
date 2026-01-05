export interface ChatSession {
    id: string;
    userId?: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessage {
    id: string;
    sessionId: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
}

export interface ChatReference {
    id: string;
    title: string;
    url?: string;
}

export interface SendMessageResponse {
    response: string;
    session_id: string;
    metadata?: any;
    references?: ChatReference[];
}
