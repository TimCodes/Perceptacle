/**
 * Routes for interacting with the Python agents service
 */
import { Router, Request, Response } from 'express';
import { agentsService } from '../services/agents';

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
 * POST /api/agents/chat
 * Send a chat message to the agent (placeholder for Feature 1.3)
 */
router.post('/chat', async (req: Request, res: Response) => {
    try {
        const { message, session_id, context } = req.body;

        if (!message) {
            return res.status(400).json({
                error: 'Bad request',
                message: 'Message is required'
            });
        }

        const response = await agentsService.chat({
            message,
            session_id,
            context
        });

        res.json(response);
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
 * GET /api/agents/available
 * Quick check if agents service is reachable
 */
router.get('/available', async (req: Request, res: Response) => {
    const available = await agentsService.isAvailable();
    res.json({ available });
});

export default router;
