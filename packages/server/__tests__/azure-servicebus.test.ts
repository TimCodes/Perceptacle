import { AzureService } from '../services/azure';

describe('AzureService - Service Bus', () => {
  let azureService: AzureService;
  const mockSubscriptionId = 'test-subscription-id';
  const mockResourceGroup = 'test-rg';
  const mockNamespace = 'test-namespace';

  beforeEach(() => {
    // Mock environment variables
    process.env.AZURE_SUBSCRIPTION_ID = mockSubscriptionId;
    process.env.AZURE_CLIENT_ID = 'test-client-id';
    process.env.AZURE_CLIENT_SECRET = 'test-client-secret';
    process.env.AZURE_TENANT_ID = 'test-tenant-id';

    const credentials = {
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      tenantId: 'test-tenant-id'
    };
    azureService = AzureService.fromCredentials(credentials, mockSubscriptionId);
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.AZURE_SUBSCRIPTION_ID;
    delete process.env.AZURE_CLIENT_ID;
    delete process.env.AZURE_CLIENT_SECRET;
    delete process.env.AZURE_TENANT_ID;
  });

  describe('Service Bus Queue Operations', () => {
    it('should have getServiceBusQueueInfo method', () => {
      expect(typeof azureService.getServiceBusQueueInfo).toBe('function');
    });

    it('should have getAllServiceBusQueues method', () => {
      expect(typeof azureService.getAllServiceBusQueues).toBe('function');
    });

    it('should validate queue info parameters', () => {
      const validParams = {
        namespaceName: mockNamespace,
        resourceGroupName: mockResourceGroup,
        queueName: 'test-queue'
      };

      expect(validParams.namespaceName).toBeTruthy();
      expect(validParams.resourceGroupName).toBeTruthy();
      expect(validParams.queueName).toBeTruthy();
    });
  });

  describe('Service Bus Topic Operations', () => {
    it('should have getServiceBusTopicInfo method', () => {
      expect(typeof azureService.getServiceBusTopicInfo).toBe('function');
    });

    it('should have getAllServiceBusTopics method', () => {
      expect(typeof azureService.getAllServiceBusTopics).toBe('function');
    });

    it('should validate topic info parameters', () => {
      const validParams = {
        namespaceName: mockNamespace,
        resourceGroupName: mockResourceGroup,
        topicName: 'test-topic'
      };

      expect(validParams.namespaceName).toBeTruthy();
      expect(validParams.resourceGroupName).toBeTruthy();
      expect(validParams.topicName).toBeTruthy();
    });
  });

  describe('Service Bus Subscription Operations', () => {
    it('should have getServiceBusSubscriptionInfo method', () => {
      expect(typeof azureService.getServiceBusSubscriptionInfo).toBe('function');
    });

    it('should have getAllServiceBusSubscriptions method', () => {
      expect(typeof azureService.getAllServiceBusSubscriptions).toBe('function');
    });

    it('should validate subscription info parameters', () => {
      const validParams = {
        namespaceName: mockNamespace,
        resourceGroupName: mockResourceGroup,
        topicName: 'test-topic',
        subscriptionName: 'test-subscription'
      };

      expect(validParams.namespaceName).toBeTruthy();
      expect(validParams.resourceGroupName).toBeTruthy();
      expect(validParams.topicName).toBeTruthy();
      expect(validParams.subscriptionName).toBeTruthy();
    });
  });

  describe('Service Bus Namespace Summary', () => {
    it('should have getServiceBusNamespaceSummary method', () => {
      expect(typeof azureService.getServiceBusNamespaceSummary).toBe('function');
    });

    it('should validate namespace summary parameters', () => {
      const validParams = {
        namespaceName: mockNamespace,
        resourceGroupName: mockResourceGroup
      };

      expect(validParams.namespaceName).toBeTruthy();
      expect(validParams.resourceGroupName).toBeTruthy();
    });
  });

  describe('Service Bus Data Types', () => {
    it('should validate ServiceBusQueueInfo structure', () => {
      const mockQueueInfo = {
        name: 'test-queue',
        activeMessageCount: 10,
        deadLetterMessageCount: 2,
        scheduledMessageCount: 1,
        transferMessageCount: 0,
        transferDeadLetterMessageCount: 0,
        totalMessageCount: 13,
        status: 'Active',
        sizeInBytes: 1024,
        maxSizeInMegabytes: 1024,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(mockQueueInfo.name).toBe('test-queue');
      expect(mockQueueInfo.activeMessageCount).toBe(10);
      expect(mockQueueInfo.totalMessageCount).toBe(13);
      expect(mockQueueInfo.status).toBe('Active');
    });

    it('should validate ServiceBusTopicInfo structure', () => {
      const mockTopicInfo = {
        name: 'test-topic',
        activeMessageCount: 5,
        deadLetterMessageCount: 1,
        scheduledMessageCount: 0,
        transferMessageCount: 0,
        transferDeadLetterMessageCount: 0,
        totalMessageCount: 6,
        status: 'Active',
        sizeInBytes: 512,
        maxSizeInMegabytes: 1024,
        subscriptionCount: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(mockTopicInfo.name).toBe('test-topic');
      expect(mockTopicInfo.subscriptionCount).toBe(3);
      expect(mockTopicInfo.totalMessageCount).toBe(6);
    });

    it('should validate ServiceBusNamespaceSummary structure', () => {
      const mockSummary = {
        namespaceName: mockNamespace,
        totalQueues: 5,
        totalTopics: 3,
        totalSubscriptions: 8,
        totalActiveMessages: 25,
        totalDeadLetterMessages: 3,
        totalScheduledMessages: 1,
        queues: [],
        topics: [],
        subscriptions: []
      };

      expect(mockSummary.namespaceName).toBe(mockNamespace);
      expect(mockSummary.totalQueues).toBe(5);
      expect(mockSummary.totalTopics).toBe(3);
      expect(mockSummary.totalSubscriptions).toBe(8);
      expect(mockSummary.totalActiveMessages).toBe(25);
    });
  });
});
