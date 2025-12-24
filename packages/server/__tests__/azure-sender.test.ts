import { AzureService } from '../services/azure';
import { DefaultAzureCredential } from '@azure/identity';

// Stub for DefaultAzureCredential
class MockCredential { }

jest.mock('@azure/identity', () => ({
    DefaultAzureCredential: jest.fn().mockImplementation(() => new MockCredential()),
    ClientSecretCredential: jest.fn(),
}));

// Mock Azure clients
const mockSendMessages = jest.fn().mockResolvedValue(undefined);
const mockClose = jest.fn().mockResolvedValue(undefined);
const mockSender = {
    sendMessages: mockSendMessages,
    close: mockClose,
};

const mockCreateSender = jest.fn().mockReturnValue(mockSender);

jest.mock('@azure/service-bus', () => ({
    ServiceBusClient: jest.fn().mockImplementation(() => ({
        createSender: mockCreateSender,
    })),
    ServiceBusAdministrationClient: jest.fn(),
    ServiceBusManagementClient: jest.fn(),
}));

jest.mock('@azure/arm-resources', () => ({
    ResourceManagementClient: jest.fn(),
}));

jest.mock('@azure/arm-monitor', () => ({
    MonitorClient: jest.fn(),
}));

jest.mock('@azure/arm-operationalinsights', () => ({
    OperationalInsightsManagementClient: jest.fn(),
}));

jest.mock('@azure/arm-servicebus', () => ({
    ServiceBusManagementClient: jest.fn(),
}));

jest.mock('@azure/monitor-query-logs', () => ({
    LogsQueryClient: jest.fn(),
}));

jest.mock('@azure/monitor-query-metrics', () => ({
    MetricsClient: jest.fn(),
}));

describe('AzureService - Service Bus Sender', () => {
    let service: AzureService;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize ServiceBusClient if namespace is provided', () => {
        const { ServiceBusClient } = require('@azure/service-bus');
        service = new AzureService(new DefaultAzureCredential() as any, 'sub-id', 'test.servicebus.windows.net');
        expect(ServiceBusClient).toHaveBeenCalledWith('test.servicebus.windows.net', expect.any(MockCredential));
    });

    it('should not initialize ServiceBusClient if namespace is missing', () => {
        const { ServiceBusClient } = require('@azure/service-bus');
        service = new AzureService(new DefaultAzureCredential() as any, 'sub-id');
        expect(ServiceBusClient).not.toHaveBeenCalled();
    });

    it('should send a message to Service Bus', async () => {
        service = new AzureService(new DefaultAzureCredential() as any, 'sub-id', 'test.servicebus.windows.net');

        const queueName = 'test-queue';
        const message = { data: 'test-data' };

        await service.sendServiceBusMessage(queueName, message);

        expect(mockCreateSender).toHaveBeenCalledWith(queueName);
        // Verify the message structure passed to sendMessages
        expect(mockSendMessages).toHaveBeenCalledWith(expect.objectContaining({
            body: message,
            contentType: 'application/json'
        }));
        expect(mockClose).toHaveBeenCalled();
    });

    it('should throw error if attempting to send without namespace', async () => {
        service = new AzureService(new DefaultAzureCredential() as any, 'sub-id');

        await expect(service.sendServiceBusMessage('queue', {})).rejects.toThrow('Service Bus client is not initialized');
    });

    it('should handle send errors', async () => {
        service = new AzureService(new DefaultAzureCredential() as any, 'sub-id', 'test.servicebus.windows.net');
        const error = new Error('Send failed');
        mockSendMessages.mockRejectedValueOnce(error);

        await expect(service.sendServiceBusMessage('queue', {})).rejects.toThrow('Send failed');
        expect(mockClose).toHaveBeenCalled(); // Should still close sender
    });
});
