import { Router, Request, Response } from 'express';
import { KubernetesService, MockKubernetesService } from '../../services';

const router = Router();

export function createMetricsRouter(k8sService: KubernetesService | MockKubernetesService) {
  // Get pod metrics (CPU and memory usage)
  router.get("/pods", async (req: Request, res: Response) => {
    try {
      const { namespace, podName } = req.query;
      
      const metrics = await k8sService.getPodMetrics(
        namespace as string, 
        podName as string
      );
      res.json(metrics);
    } catch (error: any) {
      console.error('Error getting pod metrics:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve pod metrics',
        details: error.message,
        note: 'Make sure the metrics-server is installed and running in your cluster'
      });
    }
  });

  return router;
}

export default createMetricsRouter;
