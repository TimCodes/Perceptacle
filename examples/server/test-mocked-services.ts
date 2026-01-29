#!/usr/bin/env node

/**
 * Test script for mocked services
 * This script demonstrates how the mocked services work and can be used for testing.
 */

import { serviceFactory, ServiceFactory } from './services/service-factory';

async function testMockedServices() {
  console.log('🧪 Testing Mocked Services\n');

  // Create a factory configured for mocks
  const mockFactory = new ServiceFactory({
    useMocks: true,
    azure: {
      subscriptionId: 'test-subscription-123'
    }
  });

  console.log('📊 Testing Mock Azure Service...');
  try {
    const azureService = mockFactory.createAzureService();
    
    // Test listing resources
    console.log('  ├─ Listing Azure resources...');
    const resources = await azureService.listResources({ resourceGroup: 'rg-production' });
    const resourceCount = (resources as any).value?.length || 'unknown';
    console.log(`  ├─ Found ${resourceCount} resources`);

    // Test getting metrics
    console.log('  ├─ Getting resource metrics...');
    const metrics = await azureService.getMetrics({
      resourceId: '/subscriptions/test/resourceGroups/rg-production/providers/Microsoft.Web/sites/webapp-frontend'
    });
    console.log(`  ├─ Retrieved ${metrics.length} metrics`);

    // Test Service Bus
    console.log('  ├─ Getting Service Bus namespace summary...');
    const namespaceSummary = await azureService.getServiceBusNamespaceSummary('sb-prod-namespace', 'rg-production');
    console.log(`  ├─ Namespace has ${namespaceSummary.totalQueues} queues and ${namespaceSummary.totalTopics} topics`);

    // Test logs
    console.log('  ├─ Getting resource logs...');
    const logs = await azureService.getLogs({
      resourceId: '/subscriptions/test/resourceGroups/rg-production/providers/Microsoft.Web/sites/webapp-frontend',
      query: 'traces | limit 10'
    });
    console.log(`  └─ Retrieved ${logs.length} log entries`);

    console.log('✅ Mock Azure Service tests passed!\n');
  } catch (error) {
    console.error('❌ Mock Azure Service tests failed:', error);
  }

  console.log('☸️  Testing Mock Kubernetes Service...');
  try {
    const k8sService = mockFactory.createKubernetesService();

    // Test cluster info
    console.log('  ├─ Getting cluster information...');
    const clusterInfo = await k8sService.getClusterInfo();
    console.log(`  ├─ Cluster has ${clusterInfo.nodes.length} nodes and ${clusterInfo.namespaces.length} namespaces`);

    // Test pods
    console.log('  ├─ Listing pods...');
    const pods = await k8sService.getPods();
    console.log(`  ├─ Found ${pods.length} pods across all namespaces`);

    // Test services
    console.log('  ├─ Listing services...');
    const services = await k8sService.getServices();
    console.log(`  ├─ Found ${services.length} services`);

    // Test deployments
    console.log('  ├─ Listing deployments...');
    const deployments = await k8sService.getDeployments();
    console.log(`  ├─ Found ${deployments.length} deployments`);

    // Test pod metrics
    console.log('  ├─ Getting pod metrics...');
    const metrics = await k8sService.getPodMetrics();
    console.log(`  ├─ Retrieved metrics for ${metrics.length} pods`);

    // Test pod logs
    console.log('  ├─ Getting pod logs...');
    const logs = await k8sService.getPodLogs({
      namespace: 'app-frontend',
      podName: 'web-app-deployment-7b9c8d6f5-abc12',
      tailLines: 5
    });
    console.log(`  ├─ Retrieved ${logs.split('\n').length} log lines`);

    // Test namespace resource usage
    console.log('  ├─ Getting namespace resource usage...');
    const resourceUsage = await k8sService.getNamespaceResourceUsage();
    console.log(`  ├─ Retrieved resource usage for ${resourceUsage.length} namespaces`);

    // Test health check
    console.log('  ├─ Performing health check...');
    const health = await k8sService.healthCheck();
    console.log(`  └─ Health status: ${health.status}`);

    console.log('✅ Mock Kubernetes Service tests passed!\n');
  } catch (error) {
    console.error('❌ Mock Kubernetes Service tests failed:', error);
  }

  console.log('🎯 Testing Service Factory Configuration...');
  try {
    // Test default factory (from environment)
    console.log('  ├─ Testing default factory configuration...');
    const defaultFactory = serviceFactory;
    console.log(`  ├─ Default factory using mocks: ${defaultFactory.isUsingMocks()}`);

    // Test switching configurations
    console.log('  ├─ Testing configuration switching...');
    const config = defaultFactory.getConfig();
    console.log(`  ├─ Current subscription ID: ${config.azure?.subscriptionId}`);

    defaultFactory.updateConfig({ useMocks: !config.useMocks });
    console.log(`  └─ Switched to mocks: ${defaultFactory.isUsingMocks()}`);

    console.log('✅ Service Factory tests passed!\n');
  } catch (error) {
    console.error('❌ Service Factory tests failed:', error);
  }

  console.log('🎉 All mocked service tests completed!');
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ Performance Testing...');
  
  const mockFactory = new ServiceFactory({
    useMocks: true,
    azure: { subscriptionId: 'perf-test' }
  });

  const azureService = mockFactory.createAzureService();
  const k8sService = mockFactory.createKubernetesService();

  // Test concurrent requests
  const startTime = Date.now();
  const promises = [
    azureService.listResources(),
    azureService.getMetrics({ resourceId: '/test/resource' }),
    k8sService.getClusterInfo(),
    k8sService.getPods(),
    k8sService.getServices(),
    azureService.getAllServiceBusQueues('test', 'test'),
    k8sService.getPodMetrics(),
    azureService.getLogs({ resourceId: '/test', query: 'test' })
  ];

  await Promise.all(promises);
  const duration = Date.now() - startTime;

  console.log(`✅ Completed ${promises.length} concurrent requests in ${duration}ms`);
  console.log(`   Average response time: ${(duration / promises.length).toFixed(2)}ms per request`);
}

// Run tests if this script is executed directly
if (require.main === module) {
  testMockedServices()
    .then(() => performanceTest())
    .catch(console.error);
}

export { testMockedServices, performanceTest };
