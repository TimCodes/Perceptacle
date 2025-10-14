import { ResourceManagementClient } from "@azure/arm-resources";
import { MonitorClient } from "@azure/arm-monitor";
import { OperationalInsightsManagementClient } from "@azure/arm-operationalinsights";
import { ServiceBusAdministrationClient } from "@azure/service-bus";
import { ServiceBusManagementClient } from "@azure/arm-servicebus";
import { ClientSecretCredential, DefaultAzureCredential } from "@azure/identity";
import { LogsQueryClient } from "@azure/monitor-query-logs";
import { MetricsClient } from "@azure/monitor-query-metrics";

// Types for the service
export interface AzureCredentials {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export interface ResourceQueryParams {
  resourceGroup?: string;
  location?: string;
  resourceType?: string;
  tagName?: string;
  tagValue?: string;
}

export interface MetricQueryParams {
  resourceId: string;
  timespan?: string;
  interval?: string;
  metricNames?: string[];
  aggregation?: string;
}

export interface LogQueryParams {
  resourceId: string;
  query: string;
  timespan?: string;
  workspaceId?: string;
}

export interface ResourceMetric {
  name: string;
  value: string;
  timestamp: Date;
  dimensions: Record<string, any>;
  unit?: string;
}

export interface ResourceLog {
  timestamp: Date;
  message: string;
  level: string;
  properties: Record<string, any>;
}

export interface ServiceBusQueueInfo {
  name: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferMessageCount: number;
  transferDeadLetterMessageCount: number;
  totalMessageCount: number;
  status: string;
  sizeInBytes: number;
  maxSizeInMegabytes: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceBusTopicInfo {
  name: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferMessageCount: number;
  transferDeadLetterMessageCount: number;
  totalMessageCount: number;
  status: string;
  sizeInBytes: number;
  maxSizeInMegabytes: number;
  subscriptionCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceBusSubscriptionInfo {
  name: string;
  topicName: string;
  activeMessageCount: number;
  deadLetterMessageCount: number;
  scheduledMessageCount: number;
  transferMessageCount: number;
  transferDeadLetterMessageCount: number;
  totalMessageCount: number;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ServiceBusNamespaceSummary {
  namespaceName: string;
  totalQueues: number;
  totalTopics: number;
  totalSubscriptions: number;
  totalActiveMessages: number;
  totalDeadLetterMessages: number;
  totalScheduledMessages: number;
  queues: ServiceBusQueueInfo[];
  topics: ServiceBusTopicInfo[];
  subscriptions: ServiceBusSubscriptionInfo[];
}

export class AzureService {
  private resourceClient: ResourceManagementClient;
  private monitorClient: MonitorClient;
  private operationalInsightsClient: OperationalInsightsManagementClient;
  private logsQueryClient: LogsQueryClient;
  private metricsQueryClient: MetricsClient;
  private serviceBusManagementClient: ServiceBusManagementClient;
  private subscriptionId: string;

  constructor(credentials: ClientSecretCredential | DefaultAzureCredential, subscriptionId: string) {
    this.subscriptionId = subscriptionId;
    this.resourceClient = new ResourceManagementClient(credentials, subscriptionId);
    this.monitorClient = new MonitorClient(credentials, subscriptionId);
    this.operationalInsightsClient = new OperationalInsightsManagementClient(credentials, subscriptionId);
    this.logsQueryClient = new LogsQueryClient(credentials);
    this.metricsQueryClient = new MetricsClient("https://management.azure.com", credentials);
    this.serviceBusManagementClient = new ServiceBusManagementClient(credentials, subscriptionId);
  }

  /**
   * Create Azure service instance using client credentials
   */
  static fromCredentials(credentials: AzureCredentials, subscriptionId: string): AzureService {
    const credential = new ClientSecretCredential(
      credentials.tenantId,
      credentials.clientId,
      credentials.clientSecret
    );
    return new AzureService(credential, subscriptionId);
  }

  /**
   * Create Azure service instance using default Azure credentials
   */
  static fromDefaultCredentials(subscriptionId: string): AzureService {
    const credential = new DefaultAzureCredential();
    return new AzureService(credential, subscriptionId);
  }

  /**
   * List Azure resources with optional filtering
   */
  async listResources(params?: ResourceQueryParams) {
    try {
      const resources = await this.resourceClient.resources.list({
        filter: this.buildResourceFilter(params)
      });
      return resources;
    } catch (error) {
      console.error('Error listing Azure resources', { error });
      throw error;
    }
  }

  /**
   * Get a specific Azure resource by ID
   */
  async getResource(resourceId: string) {
    try {
      const parts = this.parseResourceId(resourceId);
      if (!parts) {
        throw new Error('Invalid resource ID format');
      }

      const resource = await this.resourceClient.resources.getById(resourceId, "2021-04-01");
      return resource;
    } catch (error) {
      console.error('Error getting Azure resource', { error, resourceId });
      throw error;
    }
  }

  /**
   * Get metrics for an Azure resource
   */
  async getMetrics(params: MetricQueryParams): Promise<ResourceMetric[]> {
    try {
      const metrics = await this.monitorClient.metrics.list(
        params.resourceId,
        {
          timespan: params.timespan,
          interval: params.interval,
          metricnames: params.metricNames?.join(','),
          aggregation: params.aggregation
        }
      );

      return (metrics.value || []).map(metric => {
        const timeseriesData = metric.timeseries?.[0]?.data || [];
        
        // Get the latest data point or aggregate if multiple points exist
        const latestData = timeseriesData[timeseriesData.length - 1];
        
        return {
          name: metric.name?.value || '',
          value: this.extractMetricValue(latestData),
          timestamp: latestData?.timeStamp || new Date(),
          dimensions: {},  // Simplified - dimensions are typically in timeseries
          unit: metric.unit || ''
        };
      });
    } catch (error) {
      console.error('Error getting Azure metrics', { error, params });
      throw error;
    }
  }

  /**
   * Get available metric definitions for a resource
   */
  async getMetricDefinitions(resourceId: string) {
    try {
      const definitions = await this.monitorClient.metricDefinitions.list(resourceId);
      const result: any[] = [];
      for await (const def of definitions) {
        result.push({
          name: def.name?.value,
          displayName: def.name?.localizedValue || def.name?.value,
          category: def.category,
          unit: def.unit,
          aggregationTypes: def.supportedAggregationTypes,
          availabilities: def.metricAvailabilities
        });
      }
      return result;
    } catch (error) {
      console.error('Error getting metric definitions', { error, resourceId });
      throw error;
    }
  }

  /**
   * Query logs for an Azure resource using KQL (Kusto Query Language)
   */
  async getLogs(params: LogQueryParams): Promise<ResourceLog[]> {
    try {
      if (!params.workspaceId) {
        throw new Error('Workspace ID is required for log queries');
      }

      const kustoQuery = params.query;
      const duration = params.timespan || 'PT1H'; // Default to last 1 hour

      const result = await this.logsQueryClient.queryWorkspace(
        params.workspaceId,
        kustoQuery,
        { duration }
      );

      // Handle successful result
      if (result.status === 'Success') {
        const tables = result.tables;
        if (!tables || tables.length === 0) {
          return [];
        }

        const table = tables[0];
        const logs: ResourceLog[] = [];

        for (const row of table.rows) {
          const logEntry: ResourceLog = {
            timestamp: this.parseLogTimestamp(row, table.columnDescriptors),
            message: this.extractLogMessage(row, table.columnDescriptors),
            level: this.extractLogLevel(row, table.columnDescriptors),
            properties: this.extractLogProperties(row, table.columnDescriptors)
          };
          logs.push(logEntry);
        }

        return logs;
      } else {
        console.warn('Partial result received from logs query', result);
        return [];
      }
      
    } catch (error) {
      console.error('Error getting Azure logs', { error, params });
      throw error;
    }
  }

  /**
   * Get diagnostic settings for a resource
   */
  async getDiagnosticSettings(resourceId: string) {
    try {
      const settings = await this.monitorClient.diagnosticSettings.list(resourceId);
      return settings.value || [];
    } catch (error) {
      console.error('Error getting diagnostic settings', { error, resourceId });
      throw error;
    }
  }

  /**
   * Get Service Bus queue message counts and details
   */
  async getServiceBusQueueInfo(namespaceName: string, resourceGroupName: string, queueName: string): Promise<ServiceBusQueueInfo> {
    try {
      const queue = await this.serviceBusManagementClient.queues.get(
        resourceGroupName,
        namespaceName,
        queueName
      );

      return {
        name: queueName,
        activeMessageCount: queue.countDetails?.activeMessageCount || 0,
        deadLetterMessageCount: queue.countDetails?.deadLetterMessageCount || 0,
        scheduledMessageCount: queue.countDetails?.scheduledMessageCount || 0,
        transferMessageCount: queue.countDetails?.transferMessageCount || 0,
        transferDeadLetterMessageCount: queue.countDetails?.transferDeadLetterMessageCount || 0,
        totalMessageCount: (queue.countDetails?.activeMessageCount || 0) + 
                          (queue.countDetails?.deadLetterMessageCount || 0) + 
                          (queue.countDetails?.scheduledMessageCount || 0),
        status: queue.status || 'Unknown',
        sizeInBytes: queue.sizeInBytes || 0,
        maxSizeInMegabytes: queue.maxSizeInMegabytes || 0,
        createdAt: queue.createdAt,
        updatedAt: queue.updatedAt
      };
    } catch (error) {
      console.error('Error getting Service Bus queue info', { error, namespaceName, queueName });
      throw error;
    }
  }

  /**
   * Get Service Bus topic message counts and details
   */
  async getServiceBusTopicInfo(namespaceName: string, resourceGroupName: string, topicName: string): Promise<ServiceBusTopicInfo> {
    try {
      const topic = await this.serviceBusManagementClient.topics.get(
        resourceGroupName,
        namespaceName,
        topicName
      );

      // Get subscription count for the topic
      const subscriptions = await this.serviceBusManagementClient.subscriptions.listByTopic(
        resourceGroupName,
        namespaceName,
        topicName
      );
      
      let subscriptionCount = 0;
      for await (const subscription of subscriptions) {
        subscriptionCount++;
      }

      return {
        name: topicName,
        activeMessageCount: topic.countDetails?.activeMessageCount || 0,
        deadLetterMessageCount: topic.countDetails?.deadLetterMessageCount || 0,
        scheduledMessageCount: topic.countDetails?.scheduledMessageCount || 0,
        transferMessageCount: topic.countDetails?.transferMessageCount || 0,
        transferDeadLetterMessageCount: topic.countDetails?.transferDeadLetterMessageCount || 0,
        totalMessageCount: (topic.countDetails?.activeMessageCount || 0) + 
                          (topic.countDetails?.deadLetterMessageCount || 0) + 
                          (topic.countDetails?.scheduledMessageCount || 0),
        status: topic.status || 'Unknown',
        sizeInBytes: topic.sizeInBytes || 0,
        maxSizeInMegabytes: topic.maxSizeInMegabytes || 0,
        subscriptionCount,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt
      };
    } catch (error) {
      console.error('Error getting Service Bus topic info', { error, namespaceName, topicName });
      throw error;
    }
  }

  /**
   * Get Service Bus subscription message counts and details
   */
  async getServiceBusSubscriptionInfo(namespaceName: string, resourceGroupName: string, topicName: string, subscriptionName: string): Promise<ServiceBusSubscriptionInfo> {
    try {
      const subscription = await this.serviceBusManagementClient.subscriptions.get(
        resourceGroupName,
        namespaceName,
        topicName,
        subscriptionName
      );

      return {
        name: subscriptionName,
        topicName,
        activeMessageCount: subscription.countDetails?.activeMessageCount || 0,
        deadLetterMessageCount: subscription.countDetails?.deadLetterMessageCount || 0,
        scheduledMessageCount: subscription.countDetails?.scheduledMessageCount || 0,
        transferMessageCount: subscription.countDetails?.transferMessageCount || 0,
        transferDeadLetterMessageCount: subscription.countDetails?.transferDeadLetterMessageCount || 0,
        totalMessageCount: (subscription.countDetails?.activeMessageCount || 0) + 
                          (subscription.countDetails?.deadLetterMessageCount || 0) + 
                          (subscription.countDetails?.scheduledMessageCount || 0),
        status: subscription.status || 'Unknown',
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
      };
    } catch (error) {
      console.error('Error getting Service Bus subscription info', { error, namespaceName, topicName, subscriptionName });
      throw error;
    }
  }

  /**
   * Get all queues in a Service Bus namespace
   */
  async getAllServiceBusQueues(namespaceName: string, resourceGroupName: string): Promise<ServiceBusQueueInfo[]> {
    try {
      const queues = await this.serviceBusManagementClient.queues.listByNamespace(
        resourceGroupName,
        namespaceName
      );

      const queueInfos: ServiceBusQueueInfo[] = [];
      for await (const queue of queues) {
        if (queue.name) {
          const queueInfo = await this.getServiceBusQueueInfo(namespaceName, resourceGroupName, queue.name);
          queueInfos.push(queueInfo);
        }
      }

      return queueInfos;
    } catch (error) {
      console.error('Error getting all Service Bus queues', { error, namespaceName });
      throw error;
    }
  }

  /**
   * Get all topics in a Service Bus namespace
   */
  async getAllServiceBusTopics(namespaceName: string, resourceGroupName: string): Promise<ServiceBusTopicInfo[]> {
    try {
      const topics = await this.serviceBusManagementClient.topics.listByNamespace(
        resourceGroupName,
        namespaceName
      );

      const topicInfos: ServiceBusTopicInfo[] = [];
      for await (const topic of topics) {
        if (topic.name) {
          const topicInfo = await this.getServiceBusTopicInfo(namespaceName, resourceGroupName, topic.name);
          topicInfos.push(topicInfo);
        }
      }

      return topicInfos;
    } catch (error) {
      console.error('Error getting all Service Bus topics', { error, namespaceName });
      throw error;
    }
  }

  /**
   * Get all subscriptions for all topics in a Service Bus namespace
   */
  async getAllServiceBusSubscriptions(namespaceName: string, resourceGroupName: string): Promise<ServiceBusSubscriptionInfo[]> {
    try {
      const topics = await this.serviceBusManagementClient.topics.listByNamespace(
        resourceGroupName,
        namespaceName
      );

      const subscriptionInfos: ServiceBusSubscriptionInfo[] = [];
      for await (const topic of topics) {
        if (topic.name) {
          const subscriptions = await this.serviceBusManagementClient.subscriptions.listByTopic(
            resourceGroupName,
            namespaceName,
            topic.name
          );

          for await (const subscription of subscriptions) {
            if (subscription.name) {
              const subscriptionInfo = await this.getServiceBusSubscriptionInfo(
                namespaceName,
                resourceGroupName,
                topic.name,
                subscription.name
              );
              subscriptionInfos.push(subscriptionInfo);
            }
          }
        }
      }

      return subscriptionInfos;
    } catch (error) {
      console.error('Error getting all Service Bus subscriptions', { error, namespaceName });
      throw error;
    }
  }

  /**
   * Get comprehensive summary of a Service Bus namespace including all queues, topics, and subscriptions
   */
  async getServiceBusNamespaceSummary(namespaceName: string, resourceGroupName: string): Promise<ServiceBusNamespaceSummary> {
    try {
      console.log(`Getting Service Bus namespace summary for: ${namespaceName}`);

      // Get all entities in parallel for better performance
      const [queues, topics, subscriptions] = await Promise.all([
        this.getAllServiceBusQueues(namespaceName, resourceGroupName),
        this.getAllServiceBusTopics(namespaceName, resourceGroupName),
        this.getAllServiceBusSubscriptions(namespaceName, resourceGroupName)
      ]);

      // Calculate totals
      const totalActiveMessages = [
        ...queues.map(q => q.activeMessageCount),
        ...topics.map(t => t.activeMessageCount),
        ...subscriptions.map(s => s.activeMessageCount)
      ].reduce((sum, count) => sum + count, 0);

      const totalDeadLetterMessages = [
        ...queues.map(q => q.deadLetterMessageCount),
        ...topics.map(t => t.deadLetterMessageCount),
        ...subscriptions.map(s => s.deadLetterMessageCount)
      ].reduce((sum, count) => sum + count, 0);

      const totalScheduledMessages = [
        ...queues.map(q => q.scheduledMessageCount),
        ...topics.map(t => t.scheduledMessageCount),
        ...subscriptions.map(s => s.scheduledMessageCount)
      ].reduce((sum, count) => sum + count, 0);

      return {
        namespaceName,
        totalQueues: queues.length,
        totalTopics: topics.length,
        totalSubscriptions: subscriptions.length,
        totalActiveMessages,
        totalDeadLetterMessages,
        totalScheduledMessages,
        queues,
        topics,
        subscriptions
      };
    } catch (error) {
      console.error('Error getting Service Bus namespace summary', { error, namespaceName });
      throw error;
    }
  }

  /**
   * Build resource filter string for queries
   */
  private buildResourceFilter(params?: ResourceQueryParams): string | undefined {
    if (!params) return undefined;

    const filters: string[] = [];

    if (params.resourceGroup) {
      filters.push(`resourceGroup eq '${params.resourceGroup}'`);
    }
    if (params.location) {
      filters.push(`location eq '${params.location}'`);
    }
    if (params.resourceType) {
      filters.push(`resourceType eq '${params.resourceType}'`);
    }
    if (params.tagName && params.tagValue) {
      filters.push(`tagName eq '${params.tagName}' and tagValue eq '${params.tagValue}'`);
    }

    return filters.length > 0 ? filters.join(' and ') : undefined;
  }

  /**
   * Parse Azure resource ID into components
   */
  private parseResourceId(resourceId: string) {
    const regex = /^\/subscriptions\/([^\/]+)\/resourceGroups\/([^\/]+)\/providers\/([^\/]+)\/([^\/]+)\/([^\/]+)$/;
    const match = resourceId.match(regex);
    
    if (!match) return null;
    
    return {
      subscriptionId: match[1],
      resourceGroup: match[2],
      provider: match[3],
      resourceType: match[4],
      resourceName: match[5]
    };
  }

  /**
   * Extract metric value from time series data
   */
  private extractMetricValue(data: any): string {
    if (!data) return '0';
    
    // Try different aggregation types in order of preference
    const value = data.average ?? data.total ?? data.maximum ?? data.minimum ?? data.count ?? 0;
    return value.toString();
  }

  /**
   * Simulate log query response (placeholder for actual implementation)
   */
  private simulateLogQuery(params: LogQueryParams): ResourceLog[] {
    // This is a placeholder - real implementation would use LogsQueryClient
    // from @azure/monitor-query package
    console.log(`Simulating log query for resource: ${params.resourceId}`);
    console.log(`Query: ${params.query}`);
    
    return [
      {
        timestamp: new Date(),
        message: 'Sample log entry for resource',
        level: 'Information',
        properties: {
          resourceId: params.resourceId,
          correlationId: 'sample-correlation-id'
        }
      }
    ];
  }

  /**
   * Parse timestamp from log row
   */
  private parseLogTimestamp(row: any[], columns: any[]): Date {
    const timestampIndex = columns.findIndex(col => 
      col.name.toLowerCase().includes('timestamp') || 
      col.name.toLowerCase().includes('time') ||
      col.name === 'TimeGenerated'
    );
    
    if (timestampIndex >= 0 && row[timestampIndex]) {
      return new Date(row[timestampIndex]);
    }
    
    return new Date();
  }

  /**
   * Extract log message from row
   */
  private extractLogMessage(row: any[], columns: any[]): string {
    const messageIndex = columns.findIndex(col => 
      col.name.toLowerCase().includes('message') || 
      col.name.toLowerCase().includes('text') ||
      col.name === 'Message'
    );
    
    if (messageIndex >= 0 && row[messageIndex]) {
      return row[messageIndex].toString();
    }
    
    return 'No message';
  }

  /**
   * Extract log level from row
   */
  private extractLogLevel(row: any[], columns: any[]): string {
    const levelIndex = columns.findIndex(col => 
      col.name.toLowerCase().includes('level') || 
      col.name.toLowerCase().includes('severity') ||
      col.name === 'Level'
    );
    
    if (levelIndex >= 0 && row[levelIndex]) {
      return row[levelIndex].toString();
    }
    
    return 'Information';
  }

  /**
   * Extract additional properties from log row
   */
  private extractLogProperties(row: any[], columns: any[]): Record<string, any> {
    const properties: Record<string, any> = {};
    
    columns.forEach((col, index) => {
      if (row[index] !== null && row[index] !== undefined) {
        properties[col.name] = row[index];
      }
    });
    
    return properties;
  }
}

export default AzureService;
