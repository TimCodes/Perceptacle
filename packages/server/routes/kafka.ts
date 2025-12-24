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

export default router;
