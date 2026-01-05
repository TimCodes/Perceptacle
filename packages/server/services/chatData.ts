import { db } from "../db";
import { chatSessions, chatMessages, ChatSession, ChatMessage } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export class ChatDataService {
    /**
     * Create a new chat session
     */
    async createSession(title: string = "New Chat", userId?: string): Promise<ChatSession> {
        const [session] = await db.insert(chatSessions)
            .values({
                title,
                userId: userId || "anonymous",
            })
            .returning();
        return session;
    }

    /**
     * Add a message to a session
     */
    async addMessage(sessionId: string, role: "user" | "assistant" | "system", content: string): Promise<ChatMessage> {
        const [message] = await db.insert(chatMessages)
            .values({
                sessionId,
                role,
                content,
            })
            .returning();

        // Update session timestamp
        await db.update(chatSessions)
            .set({ updatedAt: new Date() })
            .where(eq(chatSessions.id, sessionId));

        return message;
    }

    /**
     * Get all messages for a session
     */
    async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
        return await db.query.chatMessages.findMany({
            where: eq(chatMessages.sessionId, sessionId),
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });
    }

    /**
     * Get recent sessions
     */
    async getRecentSessions(limit: number = 20): Promise<ChatSession[]> {
        return await db.query.chatSessions.findMany({
            orderBy: (sessions, { desc }) => [desc(sessions.updatedAt)],
            limit,
        });
    }

    /**
     * Get a single session
     */
    async getSession(sessionId: string): Promise<ChatSession | undefined> {
        return await db.query.chatSessions.findFirst({
            where: eq(chatSessions.id, sessionId),
        });
    }
}

export const chatDataService = new ChatDataService();
