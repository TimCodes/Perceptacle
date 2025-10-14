// Jest setup file
// Mock Azure SDK to avoid requiring real credentials during tests

jest.mock('@azure/identity', () => ({
  ClientSecretCredential: jest.fn().mockImplementation(() => ({})),
  DefaultAzureCredential: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@azure/arm-resources', () => ({
  ResourceManagementClient: jest.fn().mockImplementation(() => ({
    resources: {
      list: jest.fn().mockResolvedValue({ value: [] }),
      getById: jest.fn().mockResolvedValue({})
    }
  }))
}));

jest.mock('@azure/arm-monitor', () => ({
  MonitorClient: jest.fn().mockImplementation(() => ({
    metrics: {
      list: jest.fn().mockResolvedValue({ value: [] })
    },
    metricDefinitions: {
      list: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield {
            name: { value: 'TestMetric', localizedValue: 'Test Metric' },
            category: 'TestCategory',
            unit: 'Count',
            supportedAggregationTypes: ['Average'],
            metricAvailabilities: []
          };
        }
      })
    },
    diagnosticSettings: {
      list: jest.fn().mockResolvedValue({ value: [] })
    }
  }))
}));

jest.mock('@azure/arm-operationalinsights', () => ({
  OperationalInsightsManagementClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@azure/monitor-query-logs', () => ({
  LogsQueryClient: jest.fn().mockImplementation(() => ({
    queryWorkspace: jest.fn().mockResolvedValue({
      status: 'Success',
      tables: [{
        columnDescriptors: [
          { name: 'TimeGenerated' },
          { name: 'Message' },
          { name: 'Level' }
        ],
        rows: [
          [new Date(), 'Test log message', 'Information']
        ]
      }]
    })
  }))
}));

jest.mock('@azure/monitor-query-metrics', () => ({
  MetricsClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@azure/service-bus', () => ({
  ServiceBusAdministrationClient: jest.fn().mockImplementation(() => ({}))
}));

jest.mock('@azure/arm-servicebus', () => ({
  ServiceBusManagementClient: jest.fn().mockImplementation(() => ({
    queues: {
      get: jest.fn().mockResolvedValue({
        countDetails: {
          activeMessageCount: 10,
          deadLetterMessageCount: 2,
          scheduledMessageCount: 1,
          transferMessageCount: 0,
          transferDeadLetterMessageCount: 0
        },
        status: 'Active',
        sizeInBytes: 1024,
        maxSizeInMegabytes: 1024,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      listByNamespace: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { name: 'queue1' };
          yield { name: 'queue2' };
        }
      })
    },
    topics: {
      get: jest.fn().mockResolvedValue({
        countDetails: {
          activeMessageCount: 5,
          deadLetterMessageCount: 1,
          scheduledMessageCount: 0,
          transferMessageCount: 0,
          transferDeadLetterMessageCount: 0
        },
        status: 'Active',
        sizeInBytes: 512,
        maxSizeInMegabytes: 1024,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      listByNamespace: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { name: 'topic1' };
          yield { name: 'topic2' };
        }
      })
    },
    subscriptions: {
      get: jest.fn().mockResolvedValue({
        countDetails: {
          activeMessageCount: 3,
          deadLetterMessageCount: 0,
          scheduledMessageCount: 0,
          transferMessageCount: 0,
          transferDeadLetterMessageCount: 0
        },
        status: 'Active',
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      listByTopic: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: async function* () {
          yield { name: 'subscription1' };
          yield { name: 'subscription2' };
        }
      })
    }
  }))
}));
