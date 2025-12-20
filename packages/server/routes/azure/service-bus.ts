import { Router, type Request, Response } from "express";
import { AzureService, MockAzureService } from "../../services";

const router = Router();

export function createServiceBusRouter(azureService: AzureService | MockAzureService) {
  // Get Service Bus namespace summary (all queues, topics, and subscriptions)
  router.get("/:resourceGroupName/:namespaceName/summary", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName } = req.params;
      
      if (!resourceGroupName || !namespaceName) {
        return res.status(400).json({ error: 'Resource group name and namespace name are required' });
      }

      const summary = await azureService.getServiceBusNamespaceSummary(namespaceName, resourceGroupName);
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
  router.get("/:resourceGroupName/:namespaceName/queues", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName } = req.params;
      
      if (!resourceGroupName || !namespaceName) {
        return res.status(400).json({ error: 'Resource group name and namespace name are required' });
      }

      const queues = await azureService.getAllServiceBusQueues(namespaceName, resourceGroupName);
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
  router.get("/:resourceGroupName/:namespaceName/queues/:queueName", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName, queueName } = req.params;
      
      if (!resourceGroupName || !namespaceName || !queueName) {
        return res.status(400).json({ error: 'Resource group name, namespace name, and queue name are required' });
      }

      const queueInfo = await azureService.getServiceBusQueueInfo(namespaceName, resourceGroupName, queueName);
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
  router.get("/:resourceGroupName/:namespaceName/topics", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName } = req.params;
      
      if (!resourceGroupName || !namespaceName) {
        return res.status(400).json({ error: 'Resource group name and namespace name are required' });
      }

      const topics = await azureService.getAllServiceBusTopics(namespaceName, resourceGroupName);
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
  router.get("/:resourceGroupName/:namespaceName/topics/:topicName", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName, topicName } = req.params;
      
      if (!resourceGroupName || !namespaceName || !topicName) {
        return res.status(400).json({ error: 'Resource group name, namespace name, and topic name are required' });
      }

      const topicInfo = await azureService.getServiceBusTopicInfo(namespaceName, resourceGroupName, topicName);
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
  router.get("/:resourceGroupName/:namespaceName/subscriptions", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName } = req.params;
      
      if (!resourceGroupName || !namespaceName) {
        return res.status(400).json({ error: 'Resource group name and namespace name are required' });
      }

      const subscriptions = await azureService.getAllServiceBusSubscriptions(namespaceName, resourceGroupName);
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
  router.get("/:resourceGroupName/:namespaceName/topics/:topicName/subscriptions/:subscriptionName", async (req: Request, res: Response) => {
    try {
      const { resourceGroupName, namespaceName, topicName, subscriptionName } = req.params;
      
      if (!resourceGroupName || !namespaceName || !topicName || !subscriptionName) {
        return res.status(400).json({ error: 'Resource group name, namespace name, topic name, and subscription name are required' });
      }

      const subscriptionInfo = await azureService.getServiceBusSubscriptionInfo(namespaceName, resourceGroupName, topicName, subscriptionName);
      res.json(subscriptionInfo);
    } catch (error: any) {
      console.error('Error getting Service Bus subscription info:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve Service Bus subscription information',
        details: error.message 
      });
    }
  });

  return router;
}

export default createServiceBusRouter;
