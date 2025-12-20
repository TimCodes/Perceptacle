import { Router, Request, Response } from 'express';
import { KubernetesService, MockKubernetesService } from '../../services';

const router = Router();

export function createPodsRouter(k8sService: KubernetesService | MockKubernetesService) {
  // Get pods (optionally filtered by namespace)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const namespace = req.query.namespace as string;
      const pods = await k8sService.getPods(namespace);
      res.json(pods);
    } catch (error: any) {
      console.error('Error getting pods:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve pods',
        details: error.message 
      });
    }
  });

  // Get specific pod details
  router.get("/:namespace/:podName", async (req: Request, res: Response) => {
    try {
      const { namespace, podName } = req.params;

      if (!namespace || !podName) {
        return res.status(400).json({ error: 'Namespace and pod name are required' });
      }

      const pods = await k8sService.getPods(namespace);
      const pod = pods.find(p => p.name === podName);

      if (!pod) {
        return res.status(404).json({ error: 'Pod not found' });
      }

      res.json(pod);
    } catch (error: any) {
      console.error('Error getting pod details:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve pod details',
        details: error.message 
      });
    }
  });

  // Get logs for a specific pod
  router.get("/:namespace/:podName/logs", async (req: Request, res: Response) => {
    try {
      const { namespace, podName } = req.params;
      const { container, tailLines, sinceSeconds, follow } = req.query;

      if (!namespace || !podName) {
        return res.status(400).json({ error: 'Namespace and pod name are required' });
      }

      const logParams = {
        namespace,
        podName,
        containerName: container as string,
        tailLines: tailLines ? parseInt(tailLines as string) : undefined,
        sinceSeconds: sinceSeconds ? parseInt(sinceSeconds as string) : undefined,
        follow: follow === 'true'
      };

      const logs = await k8sService.getPodLogs(logParams);
      res.json({ logs });
    } catch (error: any) {
      console.error('Error getting pod logs:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve pod logs',
        details: error.message 
      });
    }
  });

  // Stream pod logs (experimental)
  router.get("/:namespace/:podName/logs/stream", async (req: Request, res: Response) => {
    try {
      const { namespace, podName } = req.params;
      const { container } = req.query;

      if (!namespace || !podName) {
        return res.status(400).json({ error: 'Namespace and pod name are required' });
      }

      // Set headers for server-sent events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });

      const logParams = {
        namespace,
        podName,
        containerName: container as string,
        follow: true,
        tailLines: 100
      };

      try {
        const logs = await k8sService.getPodLogs(logParams);
        res.write(`data: ${JSON.stringify({ logs })}\n\n`);
      } catch (error: any) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      }

      // Close connection after 30 seconds to prevent hanging connections
      setTimeout(() => {
        res.end();
      }, 30000);

    } catch (error: any) {
      console.error('Error streaming pod logs:', error);
      res.status(500).json({ 
        error: 'Failed to stream pod logs',
        details: error.message 
      });
    }
  });

  return router;
}

export default createPodsRouter;
