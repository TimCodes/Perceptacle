import { Router, Request, Response } from 'express';
import { KubernetesService, MockKubernetesService } from '../../services';

const router = Router();

export function createDeploymentsRouter(k8sService: KubernetesService | MockKubernetesService) {
  // Get deployments (optionally filtered by namespace)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const namespace = req.query.namespace as string;
      const deployments = await k8sService.getDeployments(namespace);
      res.json(deployments);
    } catch (error: any) {
      console.error('Error getting deployments:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve deployments',
        details: error.message 
      });
    }
  });

  return router;
}

export default createDeploymentsRouter;
