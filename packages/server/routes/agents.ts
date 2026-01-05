/**
 * Routes for interacting with the Python agents service
 */
import { Router, Request, Response } from 'express';
import { agentsService } from '../services/agents';
import { chatDataService } from '../services/chatData';

const router = Router();

/**
 * GET /api/agents/health
 * Check the health of the Python agents service
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await agentsService.checkHealth();
        res.json(health);
    } catch (error) {
        res.status(503).json({
            error: 'Agents service unavailable',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/agents/status
 * Get the status of available agents
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        const status = await agentsService.getAgentStatus();
        res.json(status);
    } catch (error) {
        res.status(503).json({
            error: 'Failed to get agent status',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/agents/sessions
 * Get recent chat sessions
 */
router.get('/sessions', async (req: Request, res: Response) => {
    try {
        const sessions = await chatDataService.getRecentSessions();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

/**
 * POST /api/agents/sessions
 * Create a new chat session
 */
router.post('/sessions', async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const session = await chatDataService.createSession(title);
        res.json(session);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create session' });
    }
});

/**
 * GET /api/agents/history/:sessionId
 * Get chat history for a session
 */
router.get('/history/:sessionId', async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const history = await chatDataService.getSessionHistory(sessionId);
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch history' });
    }
});

/**
 * POST /api/agents/chat
 * Send a chat message to the agent (with persistence)
 */
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, session_id, context } = req.body;
        let sessionId = session_id;

        if (!message) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Message is required'
            });
        }

        // 1. Create session if needed
        if (!sessionId) {
            const newSession = await chatDataService.createSession(message.substring(0, 30) + "...");
            sessionId = newSession.id;
        }

        // 2. Save user message
        await chatDataService.addMessage(sessionId, "user", message);

        // 3. Call Agent
        // TODO: This is the non-streaming call. Future update will implement streaming.
        const response = await agentsService.chat({
            message,
            session_id: sessionId,
            context
        });

        // 4. Save Assistant Message
        await chatDataService.addMessage(sessionId, "assistant", response.response);

        // 5. Return response with session ID
        res.json({
            ...response,
            session_id: sessionId
        });

    } catch (error) {
        // Check if it's a 501 Not Implemented error
        if (error instanceof Error && error.message.includes('501')) {
            return res.status(501).json({
                error: 'Not implemented',
                message: 'Chat endpoint not yet implemented. This will be available in Feature 1.3.'
            });
        }

        res.status(500).json({
            error: 'Chat request failed',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/agents/chat/stream
 * Stream chat message from the agent (with persistence)
 */
router.post('/chat/stream', async (req: Request, res: Response) => {
    try {
        const { message, session_id, context } = req.body;
        let sessionId = session_id;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // 1. Create session if needed
        if (!sessionId) {
            const newSession = await chatDataService.createSession(message.substring(0, 30) + "...");
            sessionId = newSession.id;
        }

        // 2. Save user message
        await chatDataService.addMessage(sessionId, "user", message);

        // 3. Setup SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Send session ID immediately as a custom event
        res.write(`data: ${JSON.stringify({ type: 'session_init', session_id: sessionId })}\n\n`);

        // 4. Call Python Agent Stream
        // Helper to get service URL (assuming it matches agentsService logic)
        const pythonUrl = process.env.PYTHON_AGENTS_URL || 'http://localhost:8000';

        const response = await fetch(`${pythonUrl}/chat/stream`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                session_id: sessionId,
                context
            }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`Agent service error: ${response.statusText}`);
        }

        // 5. Proxy Stream & Accumulate Content
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullResponse = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            res.write(chunk); // Pass through to client

            // Parse chunk for persistence
            // Format: data: {"type": "content", "data": "..."}\n\n
            const lines = chunk.split('\n');
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const dataStr = line.slice(6).trim();
                    if (dataStr && dataStr !== '[DONE]') {
                        try {
                            const data = JSON.parse(dataStr);
                            if (data.type === 'content') {
                                fullResponse += data.data;
                            }
                        } catch (e) {
                            // Ignore parse errors for partial chunks
                        }
                    }
                }
            }
        }

        // 6. Save Assistant Message (after stream ends)
        if (fullResponse) {
            await chatDataService.addMessage(sessionId, "assistant", fullResponse);
        }

        res.end();

    } catch (error) {
        console.error('Streaming error:', error);
        // If headers not sent, send JSON error. Else, end stream with error event?
        if (!res.headersSent) {
            res.status(500).json({ error: 'Streaming failed' });
        } else {
            res.write(`data: ${JSON.stringify({ type: 'error', error: 'Stream failed' })}\n\n`);
            res.end();
        }
    }
});

/**
 * GET /api/agents/available
 * Quick check if agents service is reachable
 */
router.get('/available', async (req: Request, res: Response) => {
    const available = await agentsService.isAvailable();
    res.json({ available });
});

export default router;
