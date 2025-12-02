/**
 * RAG Service Routes
 * 
 * API endpoints for interacting with the RAG (Retrieval-Augmented Generation) service
 */

import { Router, Request, Response } from 'express';
import { RagService, MockRagService } from '../services';

const router = Router();

// Determine which service to use based on environment
const useMockServices = process.env.USE_MOCK_SERVICES === 'true';
const ragService = useMockServices
    ? MockRagService.fromEnvironment()
    : RagService.fromEnvironment();

/**
 * POST /api/rag/query
 * Query the RAG service for relevant documents
 */
router.post('/query', async (req: Request, res: Response) => {
    try {
        const { query, topK, threshold, filters, namespace } = req.body;

        if (!query) {
            return res.status(400).json({
                error: 'Query parameter is required'
            });
        }

        const result = await ragService.query({
            query,
            topK: topK || 5,
            threshold: threshold || 0.7,
            filters,
            namespace
        });

        res.json(result);
    } catch (error) {
        console.error('Error querying RAG service:', error);
        res.status(500).json({
            error: 'Failed to query RAG service',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/rag/retrieve
 * Retrieve specific documents by ID
 */
router.post('/retrieve', async (req: Request, res: Response) => {
    try {
        const { documentIds, namespace } = req.body;

        if (!documentIds || !Array.isArray(documentIds)) {
            return res.status(400).json({
                error: 'documentIds array is required'
            });
        }

        const result = await ragService.retrieve({
            documentIds,
            namespace
        });

        res.json(result);
    } catch (error) {
        console.error('Error retrieving documents from RAG service:', error);
        res.status(500).json({
            error: 'Failed to retrieve documents',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * POST /api/rag/search
 * Simple search endpoint (wrapper around query)
 */
router.post('/search', async (req: Request, res: Response) => {
    try {
        const { query, topK, threshold, filters, namespace } = req.body;

        if (!query) {
            return res.status(400).json({
                error: 'Query parameter is required'
            });
        }

        const documents = await ragService.search(query, {
            topK,
            threshold,
            filters,
            namespace
        });

        res.json({
            documents,
            count: documents.length
        });
    } catch (error) {
        console.error('Error searching RAG service:', error);
        res.status(500).json({
            error: 'Failed to search RAG service',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/rag/health
 * Check RAG service health status
 */
router.get('/health', async (req: Request, res: Response) => {
    try {
        const health = await ragService.checkHealth();
        res.json(health);
    } catch (error) {
        console.error('Error checking RAG service health:', error);
        res.status(503).json({
            error: 'RAG service is unavailable',
            message: error instanceof Error ? error.message : 'Unknown error',
            status: 'unhealthy'
        });
    }
});

/**
 * GET /api/rag/stats
 * Get RAG index statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const stats = await ragService.getIndexStats();
        res.json(stats);
    } catch (error) {
        console.error('Error getting RAG index stats:', error);
        res.status(500).json({
            error: 'Failed to get index statistics',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/rag/status
 * Get RAG service availability status
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        const isAvailable = await ragService.isAvailable();
        res.json({
            available: isAvailable,
            service: useMockServices ? 'mock' : 'real',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error checking RAG service status:', error);
        res.status(500).json({
            available: false,
            service: useMockServices ? 'mock' : 'real',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
});

export default router;
