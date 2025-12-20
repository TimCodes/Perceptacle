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

// Health check endpoint
router.get("/health", (req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    service: 'azure-proxy',
    timestamp: new Date().toISOString(),
    configured: !!process.env.AZURE_SUBSCRIPTION_ID
  });
});

// Mount sub-routers with middleware
router.use("/resources", ensureAzureService, (req, res, next) => {
  if (!azureService) {
    return res.status(500).json({ error: 'Azure service not initialized' });
  }
  createResourcesRouter(azureService)(req, res, next);
});

router.use("/resources", ensureAzureService, (req, res, next) => {
  if (!azureService) {
    return res.status(500).json({ error: 'Azure service not initialized' });
  }
  createMetricsRouter(azureService)(req, res, next);
});

router.use("/resources", ensureAzureService, (req, res, next) => {
  if (!azureService) {
    return res.status(500).json({ error: 'Azure service not initialized' });
  }
  createLogsRouter(azureService)(req, res, next);
});

router.use("/service-bus", ensureAzureService, (req, res, next) => {
  if (!azureService) {
    return res.status(500).json({ error: 'Azure service not initialized' });
  }
  createServiceBusRouter(azureService)(req, res, next);
});

export default router;
