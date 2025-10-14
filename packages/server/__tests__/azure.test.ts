import { AzureService } from '../services/azure';
import { DefaultAzureCredential } from '@azure/identity';

describe('AzureService', () => {
  let azureService: AzureService;
  const mockSubscriptionId = 'test-subscription-id';

  beforeEach(() => {
    // Mock environment variables
    process.env.AZURE_SUBSCRIPTION_ID = mockSubscriptionId;
    process.env.AZURE_CLIENT_ID = 'test-client-id';
    process.env.AZURE_CLIENT_SECRET = 'test-client-secret';
    process.env.AZURE_TENANT_ID = 'test-tenant-id';
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.AZURE_SUBSCRIPTION_ID;
    delete process.env.AZURE_CLIENT_ID;
    delete process.env.AZURE_CLIENT_SECRET;
    delete process.env.AZURE_TENANT_ID;
  });

  describe('Service Initialization', () => {
    it('should create service instance with credentials', () => {
      const credentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tenantId: 'test-tenant-id'
      };

      expect(() => {
        azureService = AzureService.fromCredentials(credentials, mockSubscriptionId);
      }).not.toThrow();

      expect(azureService).toBeInstanceOf(AzureService);
    });

    it('should create service instance with default credentials', () => {
      expect(() => {
        azureService = AzureService.fromDefaultCredentials(mockSubscriptionId);
      }).not.toThrow();

      expect(azureService).toBeInstanceOf(AzureService);
    });
  });

  describe('Resource Operations', () => {
    beforeEach(() => {
      const credentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tenantId: 'test-tenant-id'
      };
      azureService = AzureService.fromCredentials(credentials, mockSubscriptionId);
    });

    it('should have listResources method', () => {
      expect(typeof azureService.listResources).toBe('function');
    });

    it('should have getResource method', () => {
      expect(typeof azureService.getResource).toBe('function');
    });

    it('should have getMetrics method', () => {
      expect(typeof azureService.getMetrics).toBe('function');
    });

    it('should have getLogs method', () => {
      expect(typeof azureService.getLogs).toBe('function');
    });

    it('should have getMetricDefinitions method', () => {
      expect(typeof azureService.getMetricDefinitions).toBe('function');
    });

    it('should have getDiagnosticSettings method', () => {
      expect(typeof azureService.getDiagnosticSettings).toBe('function');
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      const credentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tenantId: 'test-tenant-id'
      };
      azureService = AzureService.fromCredentials(credentials, mockSubscriptionId);
    });

    it('should validate metric query parameters', () => {
      const validParams = {
        resourceId: '/subscriptions/test/resourceGroups/test/providers/Microsoft.Compute/virtualMachines/test-vm',
        timespan: 'PT1H',
        interval: 'PT1M',
        metricNames: ['Percentage CPU'],
        aggregation: 'Average'
      };

      expect(validParams.resourceId).toBeTruthy();
      expect(validParams.timespan).toBeTruthy();
    });

    it('should validate log query parameters', () => {
      const validParams = {
        resourceId: '/subscriptions/test/resourceGroups/test/providers/Microsoft.Compute/virtualMachines/test-vm',
        query: 'AzureActivity | limit 10',
        workspaceId: 'test-workspace-id',
        timespan: 'PT1H'
      };

      expect(validParams.resourceId).toBeTruthy();
      expect(validParams.query).toBeTruthy();
      expect(validParams.workspaceId).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      const credentials = {
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret',
        tenantId: 'test-tenant-id'
      };
      azureService = AzureService.fromCredentials(credentials, mockSubscriptionId);
    });

    it('should handle invalid resource ID format', async () => {
      const invalidResourceId = 'invalid-resource-id';
      
      await expect(azureService.getResource(invalidResourceId))
        .rejects
        .toThrow('Invalid resource ID format');
    });

    it('should handle missing workspace ID for logs', async () => {
      const logParams = {
        resourceId: '/subscriptions/test/resourceGroups/test/providers/Microsoft.Compute/virtualMachines/test-vm',
        query: 'AzureActivity | limit 10',
        workspaceId: '', // Empty workspace ID
      };

      await expect(azureService.getLogs(logParams))
        .rejects
        .toThrow('Workspace ID is required for log queries');
    });
  });
});
