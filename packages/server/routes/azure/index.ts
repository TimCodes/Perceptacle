import { Router, type Request, Response } from "express";
import { serviceFactory } from "../../services/service-factory";
import { AzureService, MockAzureService } from "../../services";
import { createResourcesRouter } from "./resources";
import { createMetricsRouter } from "./metrics";
import { createLogsRouter } from "./logs";
import { createServiceBusRouter } from "./service-bus";

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

// Apply middleware globally
router.use(ensureAzureService);

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: 'azure-proxy',
    timestamp: new Date().toISOString(),
    configured: !!process.env.AZURE_SUBSCRIPTION_ID
  });
});

// Lazy initialization wrapper that creates routers on first request
const getResourcesRouter = () => {
  if (!azureService) throw new Error('Azure service not initialized');
  return createResourcesRouter(azureService);
};

const getMetricsRouter = () => {
  if (!azureService) throw new Error('Azure service not initialized');
  return createMetricsRouter(azureService);
};

const getLogsRouter = () => {
  if (!azureService) throw new Error('Azure service not initialized');
  return createLogsRouter(azureService);
};

const getServiceBusRouter = () => {
  if (!azureService) throw new Error('Azure service not initialized');
  return createServiceBusRouter(azureService);
};

// Mount sub-routers - resources, metrics, and logs all share /resources path
router.use("/resources", (req, res, next) => {
  try {
    const resourcesRouter = getResourcesRouter();
    const metricsRouter = getMetricsRouter();
    const logsRouter = getLogsRouter();
    
    // Try each router in sequence until one handles the request
    resourcesRouter(req, res, (err?: any) => {
      if (err) return next(err);
      if (res.headersSent) return;
      metricsRouter(req, res, (err?: any) => {
        if (err) return next(err);
        if (res.headersSent) return;
        logsRouter(req, res, next);
      });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.use("/service-bus", (req, res, next) => {
  try {
    const serviceBusRouter = getServiceBusRouter();
    serviceBusRouter(req, res, next);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
