import { Router, Request, Response } from 'express';
import { serviceFactory } from '../../services/service-factory';
import { KubernetesService, MockKubernetesService } from '../../services';
import { createPodsRouter } from './pods';
import { createServicesRouter } from './services';
import { createDeploymentsRouter } from './deployments';
import { createMetricsRouter } from './metrics';

const router = Router();

// Global variable to store the Kubernetes service instance
let k8sService: KubernetesService | MockKubernetesService | null = null;

// Middleware to ensure Kubernetes service is initialized
const ensureKubernetesService = (req: Request, res: Response, next: any) => {
  if (!k8sService) {
    try {
      k8sService = serviceFactory.createKubernetesService();
      console.log(`Kubernetes service initialized (using ${serviceFactory.isUsingMocks() ? 'mock' : 'real'} implementation)`);
    } catch (error: any) {
      console.error('Failed to initialize Kubernetes service:', error.message);
      return res.status(500).json({ 
        error: 'Kubernetes service not available',
        details: serviceFactory.isUsingMocks() 
          ? 'Failed to initialize mock Kubernetes service'
          : 'Could not connect to Kubernetes cluster. Ensure kubectl is configured properly.',
        message: error.message
      });
    }
  }
  next();
};

// Health check endpoint
router.get("/health", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const health = await k8sService!.healthCheck();
    res.json(health);
  } catch (error: any) {
    console.error('Kubernetes health check failed:', error);
    res.status(500).json({ 
      error: 'Health check failed',
      details: error.message 
    });
  }
});

// Get cluster information
router.get("/cluster", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const clusterInfo = await k8sService!.getClusterInfo();
    res.json(clusterInfo);
  } catch (error: any) {
    console.error('Error getting cluster info:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve cluster information',
      details: error.message 
    });
  }
});

// Get namespace resource usage summary
router.get("/namespaces/usage", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const usage = await k8sService!.getNamespaceResourceUsage();
    res.json(usage);
  } catch (error: any) {
    console.error('Error getting namespace usage:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve namespace usage',
      details: error.message 
    });
  }
});

// Mount sub-routers with middleware
router.use("/pods", ensureKubernetesService, (req, res, next) => {
  if (!k8sService) {
    return res.status(500).json({ error: 'Kubernetes service not initialized' });
  }
  createPodsRouter(k8sService)(req, res, next);
});

router.use("/services", ensureKubernetesService, (req, res, next) => {
  if (!k8sService) {
    return res.status(500).json({ error: 'Kubernetes service not initialized' });
  }
  createServicesRouter(k8sService)(req, res, next);
});

router.use("/deployments", ensureKubernetesService, (req, res, next) => {
  if (!k8sService) {
    return res.status(500).json({ error: 'Kubernetes service not initialized' });
  }
  createDeploymentsRouter(k8sService)(req, res, next);
});

router.use("/metrics", ensureKubernetesService, (req, res, next) => {
  if (!k8sService) {
    return res.status(500).json({ error: 'Kubernetes service not initialized' });
  }
  createMetricsRouter(k8sService)(req, res, next);
});

export default router;
