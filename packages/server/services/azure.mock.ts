// Mock implementation of the Azure service for development and testing
import {
  AzureCredentials,
  ResourceQueryParams,
  MetricQueryParams,
  LogQueryParams,
  ResourceMetric,
  ResourceLog,
  ServiceBusQueueInfo,
  ServiceBusTopicInfo,
  ServiceBusSubscriptionInfo,
  ServiceBusNamespaceSummary
} from './azure';

export class MockAzureService {
  private subscriptionId: string;

  constructor(credentials: any, subscriptionId: string) {
    this.subscriptionId = subscriptionId;
  }

  /**
   * Create mock Azure service instance using client credentials
   */
  static fromCredentials(credentials: AzureCredentials, subscriptionId: string): MockAzureService {
    return new MockAzureService(credentials, subscriptionId);
  }

  /**
   * Create mock Azure service instance using default Azure credentials
   */
  static fromDefaultCredentials(subscriptionId: string): MockAzureService {
    return new MockAzureService(null, subscriptionId);
  }

  /**
   * List mock Azure resources with optional filtering
   */
  async listResources(params?: ResourceQueryParams) {
    await this.delay(200);

    const mockResources = [
      {
        id: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.Web/sites/webapp-frontend`,
        name: 'webapp-frontend',
        type: 'Microsoft.Web/sites',
        location: 'eastus',
        tags: {
          environment: 'production',
          application: 'frontend',
          owner: 'platform-team'
        },
        properties: {
          state: 'Running',
          hostNames: ['webapp-frontend.azurewebsites.net'],
          repositoryUri: 'https://github.com/company/frontend-app.git',
          usageState: 'Normal',
          enabled: true,
          httpsOnly: true
        }
      },
      {
        id: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.Web/sites/api-backend`,
        name: 'api-backend',
        type: 'Microsoft.Web/sites',
        location: 'eastus',
        tags: {
          environment: 'production',
          application: 'backend',
          owner: 'platform-team'
        },
        properties: {
          state: 'Running',
          hostNames: ['api-backend.azurewebsites.net'],
          repositoryUri: 'https://github.com/company/backend-api.git',
          usageState: 'Normal',
          enabled: true,
          httpsOnly: true
        }
      },
      {
        id: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.Sql/servers/sql-prod-server/databases/app-database`,
        name: 'app-database',
        type: 'Microsoft.Sql/servers/databases',
        location: 'eastus',
        tags: {
          environment: 'production',
          component: 'database',
          backup: 'enabled'
        },
        properties: {
          status: 'Online',
          collation: 'SQL_Latin1_General_CP1_CI_AS',
          edition: 'Standard',
          serviceLevelObjective: 'S2',
          currentServiceObjectiveName: 'S2'
        }
      },
      {
        id: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.ServiceBus/namespaces/sb-prod-namespace`,
        name: 'sb-prod-namespace',
        type: 'Microsoft.ServiceBus/namespaces',
        location: 'eastus',
        tags: {
          environment: 'production',
          component: 'messaging',
          tier: 'standard'
        },
        properties: {
          status: 'Active',
          serviceBusEndpoint: 'https://sb-prod-namespace.servicebus.windows.net:443/',
          metricId: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.ServiceBus/namespaces/sb-prod-namespace`
        }
      },
      {
        id: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-production/providers/Microsoft.Storage/storageAccounts/stproddata001`,
        name: 'stproddata001',
        type: 'Microsoft.Storage/storageAccounts',
        location: 'eastus',
        tags: {
          environment: 'production',
          component: 'storage',
          purpose: 'application-data'
        },
        properties: {
          provisioningState: 'Succeeded',
          accountType: 'Standard_LRS',
          primaryEndpoints: {
            blob: 'https://stproddata001.blob.core.windows.net/',
            queue: 'https://stproddata001.queue.core.windows.net/',
            table: 'https://stproddata001.table.core.windows.net/',
            file: 'https://stproddata001.file.core.windows.net/'
          }
        }
      },
      {
        id: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-monitoring/providers/Microsoft.Insights/components/ai-prod-insights`,
        name: 'ai-prod-insights',
        type: 'Microsoft.Insights/components',
        location: 'eastus',
        tags: {
          environment: 'production',
          component: 'monitoring',
          team: 'devops'
        },
        properties: {
          ApplicationId: 'ai-prod-insights',
          InstrumentationKey: '12345678-1234-1234-1234-123456789abc',
          Application_Type: 'web',
          Flow_Type: 'Bluefield',
          Request_Source: 'rest'
        }
      }
    ];

    // Apply filtering if params are provided
    let filteredResources = mockResources;

    if (params?.resourceGroup) {
      filteredResources = filteredResources.filter(resource => 
        resource.id.includes(`/resourceGroups/${params.resourceGroup}/`)
      );
    }

    if (params?.location) {
      filteredResources = filteredResources.filter(resource => 
        resource.location === params.location
      );
    }

    if (params?.resourceType) {
      filteredResources = filteredResources.filter(resource => 
        resource.type === params.resourceType
      );
    }

    if (params?.tagName && params?.tagValue) {
      filteredResources = filteredResources.filter(resource => 
        (resource.tags as any)[params.tagName!] === params.tagValue
      );
    }

    return { value: filteredResources };
  }

  /**
   * Get a mock Azure resource by ID
   */
  async getResource(resourceId: string) {
    await this.delay(150);

    // Return a mock resource based on the ID
    const resourceName = resourceId.split('/').pop();
    
    return {
      id: resourceId,
      name: resourceName,
      type: 'Microsoft.Web/sites',
      location: 'eastus',
      tags: {
        environment: 'production',
        lastUpdated: new Date().toISOString()
      },
      properties: {
        state: 'Running',
        hostNames: [`${resourceName}.azurewebsites.net`],
        usageState: 'Normal',
        enabled: true,
        httpsOnly: true
      }
    };
  }

  /**
   * Get mock metrics for an Azure resource
   */
  async getMetrics(params: MetricQueryParams): Promise<ResourceMetric[]> {
    await this.delay(300);

    const resourceType = this.extractResourceType(params.resourceId);
    const baseTime = new Date();
    
    // Generate metrics based on resource type
    switch (resourceType) {
      case 'Microsoft.Web/sites':
        return this.generateWebAppMetrics(baseTime);
      case 'Microsoft.Sql/servers/databases':
        return this.generateDatabaseMetrics(baseTime);
      case 'Microsoft.ServiceBus/namespaces':
        return this.generateServiceBusMetrics(baseTime);
      case 'Microsoft.Storage/storageAccounts':
        return this.generateStorageMetrics(baseTime);
      default:
        return this.generateGenericMetrics(baseTime);
    }
  }

  /**
   * Get mock metric definitions
   */
  async getMetricDefinitions(resourceId: string) {
    await this.delay(100);

    const resourceType = this.extractResourceType(resourceId);
    
    const commonDefinitions = [
      {
        name: 'CpuPercentage',
        unit: 'Percent',
        primaryAggregationType: 'Average',
        supportedAggregationTypes: ['Average', 'Maximum', 'Minimum'],
        metricAvailabilities: [
          { timeGrain: 'PT1M', retention: 'P30D' },
          { timeGrain: 'PT5M', retention: 'P90D' }
        ]
      },
      {
        name: 'MemoryPercentage',
        unit: 'Percent',
        primaryAggregationType: 'Average',
        supportedAggregationTypes: ['Average', 'Maximum', 'Minimum'],
        metricAvailabilities: [
          { timeGrain: 'PT1M', retention: 'P30D' }
        ]
      }
    ];

    switch (resourceType) {
      case 'Microsoft.Web/sites':
        return {
          value: [
            ...commonDefinitions,
            {
              name: 'Requests',
              unit: 'Count',
              primaryAggregationType: 'Total',
              supportedAggregationTypes: ['Total', 'Average']
            },
            {
              name: 'ResponseTime',
              unit: 'Seconds',
              primaryAggregationType: 'Average',
              supportedAggregationTypes: ['Average', 'Maximum', 'Minimum']
            }
          ]
        };
      case 'Microsoft.ServiceBus/namespaces':
        return {
          value: [
            {
              name: 'IncomingMessages',
              unit: 'Count',
              primaryAggregationType: 'Total',
              supportedAggregationTypes: ['Total']
            },
            {
              name: 'OutgoingMessages',
              unit: 'Count',
              primaryAggregationType: 'Total',
              supportedAggregationTypes: ['Total']
            }
          ]
        };
      default:
        return { value: commonDefinitions };
    }
  }

  /**
   * Get mock logs for an Azure resource
   */
  async getLogs(params: LogQueryParams): Promise<ResourceLog[]> {
    await this.delay(400);

    const mockLogs: ResourceLog[] = [
      {
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        message: 'Application started successfully',
        level: 'Information',
        properties: {
          source: 'application',
          requestId: 'req-12345',
          userId: 'user-abc',
          duration: 120
        }
      },
      {
        timestamp: new Date(Date.now() - 3300000), // 55 minutes ago
        message: 'Database connection established',
        level: 'Information',
        properties: {
          source: 'database',
          connectionString: 'Server=sql-prod-server.database.windows.net',
          timeout: 30
        }
      },
      {
        timestamp: new Date(Date.now() - 2700000), // 45 minutes ago
        message: 'High CPU usage detected',
        level: 'Warning',
        properties: {
          source: 'performance',
          cpuPercentage: 85,
          threshold: 80,
          duration: 300
        }
      },
      {
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        message: 'Failed to connect to external service',
        level: 'Error',
        properties: {
          source: 'external-api',
          endpoint: 'https://api.external-service.com',
          statusCode: 503,
          retryCount: 3
        }
      },
      {
        timestamp: new Date(Date.now() - 900000), // 15 minutes ago
        message: 'Cache cleared successfully',
        level: 'Information',
        properties: {
          source: 'cache',
          type: 'redis',
          keys: 1250,
          duration: 45
        }
      },
      {
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        message: 'Scheduled backup completed',
        level: 'Information',
        properties: {
          source: 'backup',
          type: 'database',
          size: '2.5GB',
          duration: 180
        }
      }
    ];

    return mockLogs;
  }

  /**
   * Get mock diagnostic settings
   */
  async getDiagnosticSettings(resourceId: string) {
    await this.delay(100);

    return {
      value: [
        {
          id: `${resourceId}/providers/microsoft.insights/diagnosticSettings/default`,
          name: 'default',
          properties: {
            logs: [
              {
                category: 'AppServiceHTTPLogs',
                enabled: true,
                retentionPolicy: {
                  enabled: true,
                  days: 30
                }
              },
              {
                category: 'AppServiceConsoleLogs',
                enabled: true,
                retentionPolicy: {
                  enabled: true,
                  days: 30
                }
              }
            ],
            metrics: [
              {
                category: 'AllMetrics',
                enabled: true,
                retentionPolicy: {
                  enabled: true,
                  days: 30
                }
              }
            ],
            workspaceId: `/subscriptions/${this.subscriptionId}/resourceGroups/rg-monitoring/providers/Microsoft.OperationalInsights/workspaces/log-analytics-prod`
          }
        }
      ]
    };
  }

  /**
   * Get mock Service Bus queue info
   */
  async getServiceBusQueueInfo(namespaceName: string, resourceGroupName: string, queueName: string): Promise<ServiceBusQueueInfo> {
    await this.delay(200);

    return {
      name: queueName,
      activeMessageCount: Math.floor(Math.random() * 100),
      deadLetterMessageCount: Math.floor(Math.random() * 5),
      scheduledMessageCount: Math.floor(Math.random() * 10),
      transferMessageCount: 0,
      transferDeadLetterMessageCount: 0,
      totalMessageCount: Math.floor(Math.random() * 1000),
      status: 'Active',
      sizeInBytes: Math.floor(Math.random() * 1000000),
      maxSizeInMegabytes: 5120,
      createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
      updatedAt: new Date()
    };
  }

  /**
   * Get mock Service Bus topic info
   */
  async getServiceBusTopicInfo(namespaceName: string, resourceGroupName: string, topicName: string): Promise<ServiceBusTopicInfo> {
    await this.delay(200);

    return {
      name: topicName,
      activeMessageCount: Math.floor(Math.random() * 50),
      deadLetterMessageCount: Math.floor(Math.random() * 3),
      scheduledMessageCount: Math.floor(Math.random() * 8),
      transferMessageCount: 0,
      transferDeadLetterMessageCount: 0,
      totalMessageCount: Math.floor(Math.random() * 500),
      status: 'Active',
      sizeInBytes: Math.floor(Math.random() * 500000),
      maxSizeInMegabytes: 5120,
      subscriptionCount: Math.floor(Math.random() * 5) + 1,
      createdAt: new Date(Date.now() - 86400000 * 25), // 25 days ago
      updatedAt: new Date()
    };
  }

  /**
   * Get mock Service Bus subscription info
   */
  async getServiceBusSubscriptionInfo(namespaceName: string, resourceGroupName: string, topicName: string, subscriptionName: string): Promise<ServiceBusSubscriptionInfo> {
    await this.delay(150);

    return {
      name: subscriptionName,
      topicName,
      activeMessageCount: Math.floor(Math.random() * 20),
      deadLetterMessageCount: Math.floor(Math.random() * 2),
      scheduledMessageCount: Math.floor(Math.random() * 5),
      transferMessageCount: 0,
      transferDeadLetterMessageCount: 0,
      totalMessageCount: Math.floor(Math.random() * 200),
      status: 'Active',
      createdAt: new Date(Date.now() - 86400000 * 20), // 20 days ago
      updatedAt: new Date()
    };
  }

  /**
   * Get all mock Service Bus queues
   */
  async getAllServiceBusQueues(namespaceName: string, resourceGroupName: string): Promise<ServiceBusQueueInfo[]> {
    await this.delay(250);

    const mockQueues = ['order-processing', 'user-notifications', 'payment-events', 'audit-logs'];
    
    return Promise.all(
      mockQueues.map(queueName => 
        this.getServiceBusQueueInfo(namespaceName, resourceGroupName, queueName)
      )
    );
  }

  /**
   * Get all mock Service Bus topics
   */
  async getAllServiceBusTopics(namespaceName: string, resourceGroupName: string): Promise<ServiceBusTopicInfo[]> {
    await this.delay(250);

    const mockTopics = ['user-events', 'system-alerts', 'business-events'];
    
    return Promise.all(
      mockTopics.map(topicName => 
        this.getServiceBusTopicInfo(namespaceName, resourceGroupName, topicName)
      )
    );
  }

  /**
   * Get all mock Service Bus subscriptions
   */
  async getAllServiceBusSubscriptions(namespaceName: string, resourceGroupName: string): Promise<ServiceBusSubscriptionInfo[]> {
    await this.delay(300);

    const mockSubscriptions = [
      { topicName: 'user-events', subscriptionName: 'email-processor' },
      { topicName: 'user-events', subscriptionName: 'analytics-collector' },
      { topicName: 'system-alerts', subscriptionName: 'monitoring-service' },
      { topicName: 'system-alerts', subscriptionName: 'notification-hub' },
      { topicName: 'business-events', subscriptionName: 'reporting-service' }
    ];
    
    return Promise.all(
      mockSubscriptions.map(({ topicName, subscriptionName }) => 
        this.getServiceBusSubscriptionInfo(namespaceName, resourceGroupName, topicName, subscriptionName)
      )
    );
  }

  /**
   * Get mock Service Bus namespace summary
   */
  async getServiceBusNamespaceSummary(namespaceName: string, resourceGroupName: string): Promise<ServiceBusNamespaceSummary> {
    await this.delay(200);

    const [queues, topics, subscriptions] = await Promise.all([
      this.getAllServiceBusQueues(namespaceName, resourceGroupName),
      this.getAllServiceBusTopics(namespaceName, resourceGroupName),
      this.getAllServiceBusSubscriptions(namespaceName, resourceGroupName)
    ]);

    return {
      namespaceName,
      totalQueues: queues.length,
      totalTopics: topics.length,
      totalSubscriptions: subscriptions.length,
      totalActiveMessages: queues.reduce((sum, q) => sum + q.activeMessageCount, 0) + 
                          topics.reduce((sum, t) => sum + t.activeMessageCount, 0),
      totalDeadLetterMessages: queues.reduce((sum, q) => sum + q.deadLetterMessageCount, 0) + 
                              topics.reduce((sum, t) => sum + t.deadLetterMessageCount, 0),
      totalScheduledMessages: queues.reduce((sum, q) => sum + q.scheduledMessageCount, 0) + 
                             topics.reduce((sum, t) => sum + t.scheduledMessageCount, 0),
      queues,
      topics,
      subscriptions
    };
  }

  // Private helper methods

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private extractResourceType(resourceId: string): string {
    const match = resourceId.match(/\/providers\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : 'Unknown';
  }

  private generateWebAppMetrics(baseTime: Date): ResourceMetric[] {
    return [
      {
        name: 'CpuPercentage',
        value: (Math.random() * 30 + 40).toFixed(2), // 40-70%
        timestamp: baseTime,
        dimensions: { instance: 'webapp-frontend-001' },
        unit: 'Percent'
      },
      {
        name: 'MemoryPercentage',
        value: (Math.random() * 25 + 50).toFixed(2), // 50-75%
        timestamp: baseTime,
        dimensions: { instance: 'webapp-frontend-001' },
        unit: 'Percent'
      },
      {
        name: 'Requests',
        value: Math.floor(Math.random() * 1000 + 500).toString(), // 500-1500
        timestamp: baseTime,
        dimensions: { statusCode: '200' },
        unit: 'Count'
      },
      {
        name: 'ResponseTime',
        value: (Math.random() * 2 + 0.5).toFixed(3), // 0.5-2.5 seconds
        timestamp: baseTime,
        dimensions: { endpoint: '/api/health' },
        unit: 'Seconds'
      }
    ];
  }

  private generateDatabaseMetrics(baseTime: Date): ResourceMetric[] {
    return [
      {
        name: 'cpu_percent',
        value: (Math.random() * 20 + 30).toFixed(2), // 30-50%
        timestamp: baseTime,
        dimensions: {},
        unit: 'Percent'
      },
      {
        name: 'memory_percent',
        value: (Math.random() * 15 + 60).toFixed(2), // 60-75%
        timestamp: baseTime,
        dimensions: {},
        unit: 'Percent'
      },
      {
        name: 'dtu_consumption_percent',
        value: (Math.random() * 25 + 40).toFixed(2), // 40-65%
        timestamp: baseTime,
        dimensions: {},
        unit: 'Percent'
      }
    ];
  }

  private generateServiceBusMetrics(baseTime: Date): ResourceMetric[] {
    return [
      {
        name: 'IncomingMessages',
        value: Math.floor(Math.random() * 100 + 50).toString(), // 50-150
        timestamp: baseTime,
        dimensions: { entityName: 'order-processing' },
        unit: 'Count'
      },
      {
        name: 'OutgoingMessages',
        value: Math.floor(Math.random() * 95 + 45).toString(), // 45-140
        timestamp: baseTime,
        dimensions: { entityName: 'order-processing' },
        unit: 'Count'
      },
      {
        name: 'ActiveMessages',
        value: Math.floor(Math.random() * 50 + 10).toString(), // 10-60
        timestamp: baseTime,
        dimensions: { entityName: 'order-processing' },
        unit: 'Count'
      }
    ];
  }

  private generateStorageMetrics(baseTime: Date): ResourceMetric[] {
    return [
      {
        name: 'UsedCapacity',
        value: Math.floor(Math.random() * 1000000000 + 500000000).toString(), // 500MB-1.5GB
        timestamp: baseTime,
        dimensions: {},
        unit: 'Bytes'
      },
      {
        name: 'Transactions',
        value: Math.floor(Math.random() * 1000 + 200).toString(), // 200-1200
        timestamp: baseTime,
        dimensions: { apiName: 'GetBlob' },
        unit: 'Count'
      },
      {
        name: 'Availability',
        value: (Math.random() * 5 + 95).toFixed(2), // 95-100%
        timestamp: baseTime,
        dimensions: {},
        unit: 'Percent'
      }
    ];
  }

  private generateGenericMetrics(baseTime: Date): ResourceMetric[] {
    return [
      {
        name: 'CpuPercentage',
        value: (Math.random() * 50 + 25).toFixed(2), // 25-75%
        timestamp: baseTime,
        dimensions: {},
        unit: 'Percent'
      },
      {
        name: 'MemoryPercentage',
        value: (Math.random() * 40 + 30).toFixed(2), // 30-70%
        timestamp: baseTime,
        dimensions: {},
        unit: 'Percent'
      }
    ];
  }
}
