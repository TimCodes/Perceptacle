import { Router, Request, Response } from 'express';
import { KubernetesService, MockKubernetesService } from '../../services';

const router = Router();

export function createServicesRouter(k8sService: KubernetesService | MockKubernetesService) {
  // Get services (optionally filtered by namespace)
  router.get("/", async (req: Request, res: Response) => {
    try {
      const namespace = req.query.namespace as string;
      const services = await k8sService.getServices(namespace);
      res.json(services);
    } catch (error: any) {
      console.error('Error getting services:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve services',
        details: error.message 
      });
    }
  });

  // Get specific service details  
  router.get("/:namespace/:serviceName", async (req: Request, res: Response) => {
    try {
      const { namespace, serviceName } = req.params;

      if (!namespace || !serviceName) {
        return res.status(400).json({ error: 'Namespace and service name are required' });
      }

      const services = await k8sService.getServices(namespace);
      const service = services.find(s => s.name === serviceName);

      if (!service) {
        return res.status(404).json({ error: 'Service not found' });
      }

      res.json(service);
    } catch (error: any) {
      console.error('Error getting service details:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve service details',
        details: error.message 
      });
    }
  });

  // Get logs for all pods in a service
  router.get("/:namespace/:serviceName/logs", async (req: Request, res: Response) => {
    try {
      const { namespace, serviceName } = req.params;
      const { tailLines } = req.query;

      if (!namespace || !serviceName) {
        return res.status(400).json({ error: 'Namespace and service name are required' });
      }

      const logs = await k8sService.getServiceLogs(
        namespace, 
        serviceName, 
        tailLines ? parseInt(tailLines as string) : undefined
      );
      res.json({ logs });
    } catch (error: any) {
      console.error('Error getting service logs:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve service logs',
        details: error.message 
      });
    }
  });

  return router;
}

export default createServicesRouter;
