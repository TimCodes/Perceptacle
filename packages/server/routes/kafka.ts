import { Router, Request, Response } from 'express';
import { serviceFactory } from '../services/service-factory';
import { KafkaService } from '../services/kafka';

const router = Router();
let kafkaService: KafkaService | null = null;

const getKafkaService = (): KafkaService => {
    if (!kafkaService) {
        // Note: We don't have a MockKafkaService yet, so we use the real one even if mocks are enabled
        // Ideally we should implement MockKafkaService similar to others
        kafkaService = serviceFactory.createKafkaService();
    }
    return kafkaService;
};

/**
 * POST /api/kafka/send
 * Send a message to a Kafka topic
 */
router.post('/send', async (req: Request, res: Response) => {
    try {
        const { topic, messages } = req.body;

        if (!topic || !messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request body. Required: topic (string), messages (array of { key?, value }).'
            });
        }

        const service = getKafkaService();
        await service.sendMessage(topic, messages);
        return res.status(200).json({ success: true, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending Kafka message:', error);
        return res.status(500).json({
            error: 'Failed to send message',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

/**
 * GET /api/kafka/stream
 * Stream messages from a Kafka topic using Server-Sent Events (SSE)
 */
router.get('/stream', async (req: Request, res: Response) => {
    const topic = req.query.topic as string;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    let cleanupConsumer: (() => Promise<void>) | undefined;

    try {
        const service = getKafkaService();

        // Start consuming messages
        cleanupConsumer = await service.consumeMessages(topic, (message) => {
            // Send message to client
            res.write(`data: ${JSON.stringify(message)}\n\n`);
        });

        // Handle client disconnect
        req.on('close', async () => {
            console.log('Client disconnected from Kafka stream');
            if (cleanupConsumer) {
                await cleanupConsumer();
            }
        });

    } catch (error) {
        console.error('Error starting Kafka stream:', error);
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to start stream' })}\n\n`);
        res.end();
    }
});

export default router;
