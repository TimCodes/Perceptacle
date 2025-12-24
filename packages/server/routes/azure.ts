import { Router, type Request, Response } from "express";
import { serviceFactory } from "../services/service-factory";
import { AzureService, MockAzureService } from "../services";

const router = Router();

// Get Azure service instance (real or mock based on configuration)
let azureService: AzureService | MockAzureService | null = null;

// Middleware to ensure Azure service is initialized
const ensureAzureService = (req: Request, res: Response, next: any) => {
  if (!azureService) {
    try {
      azureService = serviceFactory.createAzureService();
      console.log(`Azure service initialized (using ${serviceFactory.isUsingMocks() ? 'mock' : 'real'} implementation)`);
    } catch (error) {
      console.error('Failed to initialize Azure service:', error);
      return res.status(500).json({
        error: 'Failed to initialize Azure service. Check your configuration.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  next();
};

// Get all Azure resources
router.get("/resources", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const queryParams = {
      resourceGroup: req.query.resourceGroup as string,
      location: req.query.location as string,
      resourceType: req.query.resourceType as string,
      tagName: req.query.tagName as string,
      tagValue: req.query.tagValue as string,
    };

    const resources = await azureService!.listResources(queryParams);
    res.json(resources);
  } catch (error: any) {
    console.error('Error getting Azure resources:', error);
    res.status(500).json({
      error: 'Failed to retrieve Azure resources',
      details: error.message
    });
  }
});

// Get specific Azure resource
router.get("/resources/:resourceId(*)", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    const resource = await azureService!.getResource(resourceId);
    res.json(resource);
  } catch (error: any) {
    console.error('Error getting Azure resource:', error);
    res.status(500).json({
      error: 'Failed to retrieve Azure resource',
      details: error.message
    });
  }
});

// Get metrics for an Azure resource
router.get("/resources/:resourceId(*)/metrics", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    const metricParams = {
      resourceId,
      timespan: req.query.timespan as string,
      interval: req.query.interval as string,
      metricNames: req.query.metricNames ? (req.query.metricNames as string).split(',') : undefined,
      aggregation: req.query.aggregation as string,
    };

    const metrics = await azureService!.getMetrics(metricParams);
    res.json(metrics);
  } catch (error: any) {
    console.error('Error getting Azure metrics:', error);
    res.status(500).json({
      error: 'Failed to retrieve Azure metrics',
      details: error.message
    });
  }
});

// Get metric definitions for an Azure resource
router.get("/resources/:resourceId(*)/metric-definitions", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    const definitions = await azureService!.getMetricDefinitions(resourceId);
    res.json(definitions);
  } catch (error: any) {
    console.error('Error getting metric definitions:', error);
    res.status(500).json({
      error: 'Failed to retrieve metric definitions',
      details: error.message
    });
  }
});

// Get logs for an Azure resource
router.post("/resources/:resourceId(*)/logs", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    const { query, timespan, workspaceId } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'KQL query is required' });
    }

    if (!workspaceId) {
      return res.status(400).json({ error: 'Log Analytics workspace ID is required' });
    }

    const logParams = {
      resourceId,
      query,
      timespan,
      workspaceId
    };

    const logs = await azureService!.getLogs(logParams);
    res.json(logs);
  } catch (error: any) {
    console.error('Error getting Azure logs:', error);
    res.status(500).json({
      error: 'Failed to retrieve Azure logs',
      details: error.message
    });
  }
});

// Get diagnostic settings for a resource
router.get("/resources/:resourceId(*)/diagnostic-settings", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId;

    if (!resourceId) {
      return res.status(400).json({ error: 'Resource ID is required' });
    }

    const settings = await azureService!.getDiagnosticSettings(resourceId);
    res.json(settings);
  } catch (error: any) {
    console.error('Error getting diagnostic settings:', error);
    res.status(500).json({
      error: 'Failed to retrieve diagnostic settings',
      details: error.message
    });
  }
});

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'azure-proxy',
    timestamp: new Date().toISOString(),
    configured: !!process.env.AZURE_SUBSCRIPTION_ID
  });
});

// Service Bus Routes

// Get Service Bus namespace summary (all queues, topics, and subscriptions)
router.get("/service-bus/:resourceGroupName/:namespaceName/summary", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName } = req.params;

    if (!resourceGroupName || !namespaceName) {
      return res.status(400).json({ error: 'Resource group name and namespace name are required' });
    }

    const summary = await azureService!.getServiceBusNamespaceSummary(namespaceName, resourceGroupName);
    res.json(summary);
  } catch (error: any) {
    console.error('Error getting Service Bus namespace summary:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus namespace summary',
      details: error.message
    });
  }
});

// Get all queues in a Service Bus namespace
router.get("/service-bus/:resourceGroupName/:namespaceName/queues", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName } = req.params;

    if (!resourceGroupName || !namespaceName) {
      return res.status(400).json({ error: 'Resource group name and namespace name are required' });
    }

    const queues = await azureService!.getAllServiceBusQueues(namespaceName, resourceGroupName);
    res.json(queues);
  } catch (error: any) {
    console.error('Error getting Service Bus queues:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus queues',
      details: error.message
    });
  }
});

// Get specific queue information
router.get("/service-bus/:resourceGroupName/:namespaceName/queues/:queueName", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName, queueName } = req.params;

    if (!resourceGroupName || !namespaceName || !queueName) {
      return res.status(400).json({ error: 'Resource group name, namespace name, and queue name are required' });
    }

    const queueInfo = await azureService!.getServiceBusQueueInfo(namespaceName, resourceGroupName, queueName);
    res.json(queueInfo);
  } catch (error: any) {
    console.error('Error getting Service Bus queue info:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus queue information',
      details: error.message
    });
  }
});

// Get all topics in a Service Bus namespace
router.get("/service-bus/:resourceGroupName/:namespaceName/topics", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName } = req.params;

    if (!resourceGroupName || !namespaceName) {
      return res.status(400).json({ error: 'Resource group name and namespace name are required' });
    }

    const topics = await azureService!.getAllServiceBusTopics(namespaceName, resourceGroupName);
    res.json(topics);
  } catch (error: any) {
    console.error('Error getting Service Bus topics:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus topics',
      details: error.message
    });
  }
});

// Get specific topic information
router.get("/service-bus/:resourceGroupName/:namespaceName/topics/:topicName", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName, topicName } = req.params;

    if (!resourceGroupName || !namespaceName || !topicName) {
      return res.status(400).json({ error: 'Resource group name, namespace name, and topic name are required' });
    }

    const topicInfo = await azureService!.getServiceBusTopicInfo(namespaceName, resourceGroupName, topicName);
    res.json(topicInfo);
  } catch (error: any) {
    console.error('Error getting Service Bus topic info:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus topic information',
      details: error.message
    });
  }
});

// Get all subscriptions for all topics in a namespace
router.get("/service-bus/:resourceGroupName/:namespaceName/subscriptions", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName } = req.params;

    if (!resourceGroupName || !namespaceName) {
      return res.status(400).json({ error: 'Resource group name and namespace name are required' });
    }

    const subscriptions = await azureService!.getAllServiceBusSubscriptions(namespaceName, resourceGroupName);
    res.json(subscriptions);
  } catch (error: any) {
    console.error('Error getting Service Bus subscriptions:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus subscriptions',
      details: error.message
    });
  }
});

// Get specific subscription information
router.get("/service-bus/:resourceGroupName/:namespaceName/topics/:topicName/subscriptions/:subscriptionName", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { resourceGroupName, namespaceName, topicName, subscriptionName } = req.params;

    if (!resourceGroupName || !namespaceName || !topicName || !subscriptionName) {
      return res.status(400).json({ error: 'Resource group name, namespace name, topic name, and subscription name are required' });
    }

    const subscriptionInfo = await azureService!.getServiceBusSubscriptionInfo(namespaceName, resourceGroupName, topicName, subscriptionName);
    res.json(subscriptionInfo);
  } catch (error: any) {
    console.error('Error getting Service Bus subscription info:', error);
    res.status(500).json({
      error: 'Failed to retrieve Service Bus subscription information',
      details: error.message
    });
  }
});

// Send a message to a Service Bus queue or topic
router.post("/service-bus/send", ensureAzureService, async (req: Request, res: Response) => {
  try {
    const { queueOrTopicName, message } = req.body;

    if (!queueOrTopicName || !message) {
      return res.status(400).json({ error: 'Queue/Topic name and message are required' });
    }

    await azureService!.sendServiceBusMessage(queueOrTopicName, message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error: any) {
    console.error('Error sending Service Bus message:', error);
    res.status(500).json({
      error: 'Failed to send Service Bus message',
      details: error.message
    });
  }
});

export default router;
