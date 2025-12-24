import { KafkaService } from '../services/kafka';
import { Kafka } from 'kafkajs';

// Mock kafkajs
jest.mock('kafkajs', () => {
    const mockProducer = {
        connect: jest.fn().mockResolvedValue(undefined),
        disconnect: jest.fn().mockResolvedValue(undefined),
        send: jest.fn().mockResolvedValue([{ topicName: 'test-topic', partition: 0, errorCode: 0, offset: '0' }]),
    };

    const mockKafka = {
        producer: jest.fn().mockReturnValue(mockProducer),
    };

    return {
        Kafka: jest.fn().mockImplementation(() => mockKafka),
    };
});

describe('KafkaService', () => {
    let service: KafkaService;
    let mockProducer: any;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new KafkaService({
            clientId: 'test-client',
            brokers: ['localhost:9092'],
        });
        // Get the mock producer instance
        mockProducer = (service as any).producer;
    });

    it('should connect to Kafka', async () => {
        await service.connect();
        expect(mockProducer.connect).toHaveBeenCalled();
    });

    it('should disconnect from Kafka', async () => {
        await service.connect();
        await service.disconnect();
        expect(mockProducer.disconnect).toHaveBeenCalled();
    });

    it('should send a message', async () => {
        const topic = 'test-topic';
        const messages = [{ value: 'test-message' }];

        await service.sendMessage(topic, messages);

        expect(mockProducer.connect).toHaveBeenCalled(); // Auto-connect
        expect(mockProducer.send).toHaveBeenCalledWith({
            topic,
            messages,
        });
    });

    it('should handle send errors', async () => {
        const error = new Error('Send failed');
        mockProducer.send.mockRejectedValueOnce(error);

        await expect(service.sendMessage('topic', [])).rejects.toThrow('Failed to send Kafka message: Send failed');
    });
});
