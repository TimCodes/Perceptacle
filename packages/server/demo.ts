import { AzureService } from './services/azure';

/**
 * Demo script showing how to us    // Example 7: API endpoint pattern    // Example 8: Sample curl commands
    console.log('8. Sample curl commands:');
    console.log('   Get VM metrics:');
    console.log(`   curl "${baseUrl}/resources/subscriptions/.../virtualMachines/vm1/metrics?metricNames=Percentage%20CPU&timespan=PT1H"`);
    console.log();
    console.log('   Query logs:');
    console.log(`   curl -X POST "${baseUrl}/resources/.../logs" -H "Content-Type: application/json" -d '{"query":"requests | limit 10","workspaceId":"workspace-id"}'`);
    console.log();
    console.log('   Get Service Bus namespace summary:');
    console.log(`   curl "${baseUrl}/service-bus/my-rg/my-namespace/summary"`);
    console.log();
    console.log('   Get queue message counts:');
    console.log(`   curl "${baseUrl}/service-bus/my-rg/my-namespace/queues/orders-queue"`);
    console.log();onsole.log('7. Available API endpoints:');
    const baseUrl = 'http://localhost:3000/api/azure';
    const endpoints = [
      `GET ${baseUrl}/resources`,
      `GET ${baseUrl}/resources/{resourceId}`,
      `GET ${baseUrl}/resources/{resourceId}/metrics`,
      `GET ${baseUrl}/resources/{resourceId}/metric-definitions`,
      `POST ${baseUrl}/resources/{resourceId}/logs`,
      `GET ${baseUrl}/resources/{resourceId}/diagnostic-settings`,
      `GET ${baseUrl}/service-bus/{resourceGroup}/{namespace}/summary`,
      `GET ${baseUrl}/service-bus/{resourceGroup}/{namespace}/queues`,
      `GET ${baseUrl}/service-bus/{resourceGroup}/{namespace}/queues/{queueName}`,
      `GET ${baseUrl}/service-bus/{resourceGroup}/{namespace}/topics`,
      `GET ${baseUrl}/service-bus/{resourceGroup}/{namespace}/topics/{topicName}`,
      `GET ${baseUrl}/service-bus/{resourceGroup}/{namespace}/subscriptions`,
      `GET ${baseUrl}/health`
    ];
    
    endpoints.forEach(endpoint => console.log(`🌐 ${endpoint}`));
    console.log();

    // Example 8: Sample curl commandsce
 * This would typically be run with proper Azure credentials configured
 */
async function azureServiceDemo() {
  console.log('🚀 Azure Service Demo');
  console.log('====================\n');

  try {
    // Example 1: Initialize service with default credentials
    console.log('1. Initializing Azure service...');
    const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID || 'demo-subscription-id';
    
    // In a real scenario, you would use actual credentials
    // const azureService = AzureService.fromDefaultCredentials(subscriptionId);
    
    // For demo purposes, we'll show the initialization pattern
    const demoCredentials = {
      clientId: 'demo-client-id',
      clientSecret: 'demo-client-secret',
      tenantId: 'demo-tenant-id'
    };
    
    const azureService = AzureService.fromCredentials(demoCredentials, subscriptionId);
    console.log('✅ Azure service initialized\n');

    // Example 2: Resource query parameters
    console.log('2. Example resource query parameters:');
    const resourceQueryParams = {
      resourceGroup: 'my-resource-group',
      location: 'eastus',
      resourceType: 'Microsoft.Compute/virtualMachines'
    };
    console.log('📋 Resource filters:', resourceQueryParams);
    console.log('   This would list all VMs in the specified resource group and location\n');

    // Example 3: Metrics query parameters
    console.log('3. Example metrics query parameters:');
    const metricsParams = {
      resourceId: '/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Compute/virtualMachines/vm-name',
      timespan: 'PT1H', // Last 1 hour
      interval: 'PT5M', // 5-minute intervals
      metricNames: ['Percentage CPU', 'Network In', 'Network Out'],
      aggregation: 'Average'
    };
    console.log('📊 Metrics query:', metricsParams);
    console.log('   This would get CPU and network metrics for the last hour\n');

    // Example 4: Log query parameters
    console.log('4. Example log query parameters:');
    const logParams = {
      resourceId: '/subscriptions/sub-id/resourceGroups/rg/providers/Microsoft.Insights/components/app-insights',
      query: `
        requests 
        | where timestamp > ago(1h) 
        | summarize RequestCount=count(), AvgDuration=avg(duration) by bin(timestamp, 5m)
        | order by timestamp desc
      `,
      workspaceId: 'workspace-id',
      timespan: 'PT1H'
    };
    console.log('📝 Log query (KQL):', {
      resourceId: logParams.resourceId,
      workspaceId: logParams.workspaceId,
      query: logParams.query.trim()
    });
    console.log('   This would get request statistics from Application Insights\n');

    // Example 5: Service Bus namespace summary
    console.log('5. Example Service Bus namespace summary:');
    const serviceBusParams = {
      resourceGroupName: 'my-resource-group',
      namespaceName: 'my-servicebus-namespace'
    };
    console.log('🚌 Service Bus namespace:', serviceBusParams);
    console.log('   This would get a complete summary of all queues, topics, and subscriptions\n');

    // Example 6: Service Bus queue message counts
    console.log('6. Example Service Bus queue info:');
    const queueParams = {
      resourceGroupName: 'my-resource-group',
      namespaceName: 'my-servicebus-namespace',
      queueName: 'orders-queue'
    };
    console.log('📬 Queue parameters:', queueParams);
    console.log('   This would get message counts including active, dead letter, and scheduled messages\n');

    // Example 7: API endpoint patterns
    console.log('5. Available API endpoints:');
    const baseUrl = 'http://localhost:5000/api/azure';
    const endpoints = [
      `GET ${baseUrl}/resources`,
      `GET ${baseUrl}/resources/{resourceId}`,
      `GET ${baseUrl}/resources/{resourceId}/metrics`,
      `GET ${baseUrl}/resources/{resourceId}/metric-definitions`,
      `POST ${baseUrl}/resources/{resourceId}/logs`,
      `GET ${baseUrl}/resources/{resourceId}/diagnostic-settings`,
      `GET ${baseUrl}/health`
    ];
    
    endpoints.forEach(endpoint => console.log(`🌐 ${endpoint}`));
    console.log();

    // Example 6: Sample curl commands
    console.log('6. Sample curl commands:');
    console.log('   Get VM metrics:');
    console.log(`   curl "${baseUrl}/resources/subscriptions/.../virtualMachines/vm1/metrics?metricNames=Percentage%20CPU&timespan=PT1H"`);
    console.log();
    console.log('   Query logs:');
    console.log(`   curl -X POST "${baseUrl}/resources/.../logs" -H "Content-Type: application/json" -d '{"query":"requests | limit 10","workspaceId":"workspace-id"}'`);
    console.log();

    console.log('✨ Demo completed! The Azure service is ready to use.');
    console.log('📖 See AZURE_SERVICE.md for detailed documentation.');

  } catch (error) {
    console.error('❌ Demo error:', error);
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  azureServiceDemo();
}

export { azureServiceDemo };
