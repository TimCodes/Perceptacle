import { Router, Request, Response } from 'express';
import { serviceFactory } from '../services/service-factory';
import { KubernetesService, MockKubernetesService } from '../services';

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

// Get pods (optionally filtered by namespace)
router.get("/pods", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const namespace = req.query.namespace as string;
    const pods = await k8sService!.getPods(namespace);
    res.json(pods);
  } catch (error: any) {
    console.error('Error getting pods:', error);
    res.status(500).json({
      error: 'Failed to retrieve pods',
      details: error.message
    });
  }
});

// Get services (optionally filtered by namespace)
router.get("/services", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const namespace = req.query.namespace as string;
    const services = await k8sService!.getServices(namespace);
    res.json(services);
  } catch (error: any) {
    console.error('Error getting services:', error);
    res.status(500).json({
      error: 'Failed to retrieve services',
      details: error.message
    });
  }
});

// Get deployments (optionally filtered by namespace)
router.get("/deployments", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const namespace = req.query.namespace as string;
    const deployments = await k8sService!.getDeployments(namespace);
    res.json(deployments);
  } catch (error: any) {
    console.error('Error getting deployments:', error);
    res.status(500).json({
      error: 'Failed to retrieve deployments',
      details: error.message
    });
  }
});

// Get logs for a specific pod
router.get("/pods/:namespace/:podName/logs", ensureKubernetesService, async (req: Request, res: Response) => {
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

    const logs = await k8sService!.getPodLogs(logParams);
    res.json({ logs });
  } catch (error: any) {
    console.error('Error getting pod logs:', error);
    res.status(500).json({
      error: 'Failed to retrieve pod logs',
      details: error.message
    });
  }
});

// Get logs for all pods in a service
router.get("/services/:namespace/:serviceName/logs", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const { namespace, serviceName } = req.params;
    const { tailLines } = req.query;

    if (!namespace || !serviceName) {
      return res.status(400).json({ error: 'Namespace and service name are required' });
    }

    const logs = await k8sService!.getServiceLogs(
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

// Get pod metrics (CPU and memory usage)
router.get("/metrics/pods", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const { namespace, podName } = req.query;

    const metrics = await k8sService!.getPodMetrics(
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

// Get specific pod details
router.get("/pods/:namespace/:podName", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const { namespace, podName } = req.params;

    if (!namespace || !podName) {
      return res.status(400).json({ error: 'Namespace and pod name are required' });
    }

    const pods = await k8sService!.getPods(namespace);
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

// Get specific service details  
router.get("/services/:namespace/:serviceName", ensureKubernetesService, async (req: Request, res: Response) => {
  try {
    const { namespace, serviceName } = req.params;

    if (!namespace || !serviceName) {
      return res.status(400).json({ error: 'Namespace and service name are required' });
    }

    const services = await k8sService!.getServices(namespace);
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

// Stream pod logs (experimental)
router.get("/pods/:namespace/:podName/logs/stream", ensureKubernetesService, async (req: Request, res: Response) => {
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
      const logs = await k8sService!.getPodLogs(logParams);
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



export default router;
