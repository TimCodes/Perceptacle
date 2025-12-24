import { Kafka, Producer, ProducerRecord, Message } from 'kafkajs';

export interface KafkaConfig {
    clientId: string;
    brokers: string[];
}

export class KafkaService {
    private kafka: Kafka;
    private producer: Producer;
    private connected: boolean = false;

    constructor(config: KafkaConfig) {
        this.kafka = new Kafka({
            clientId: config.clientId,
            brokers: config.brokers,
        });
        this.producer = this.kafka.producer();
    }

    /**
     * Connect to the Kafka cluster
     */
    async connect(): Promise<void> {
        if (this.connected) {
            return;
        }

        try {
            await this.producer.connect();
            this.connected = true;
            console.log('Connected to Kafka producer');
        } catch (error) {
            console.error('Failed to connect to Kafka:', error);
            throw new Error(`Kafka connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Disconnect from the Kafka cluster
     */
    async disconnect(): Promise<void> {
        if (!this.connected) {
            return;
        }

        try {
            await this.producer.disconnect();
            this.connected = false;
            console.log('Disconnected from Kafka producer');
        } catch (error) {
            console.error('Failed to disconnect from Kafka:', error);
            // We don't throw here to allow cleanup to proceed best-effort
        }
    }

    /**
     * Send a message to a topic
     */
    async sendMessage(topic: string, messages: Message[]): Promise<void> {
        if (!this.connected) {
            await this.connect();
        }

        try {
            const record: ProducerRecord = {
                topic,
                messages,
            };

            await this.producer.send(record);
        } catch (error) {
            console.error(`Failed to send message to topic ${topic}:`, error);
            throw new Error(`Failed to send Kafka message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
