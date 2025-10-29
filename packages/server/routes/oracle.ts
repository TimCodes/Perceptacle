import { Router, type Request, Response } from "express";
import { serviceFactory } from "../services/service-factory";
import { OracleService, MockOracleService } from "../services";

const router = Router();

// Get Oracle service instance (real or mock based on configuration)
let oracleService: OracleService | MockOracleService | null = null;

// Middleware to ensure Oracle service is initialized
const ensureOracleService = (req: Request, res: Response, next: any) => {
  if (!oracleService) {
    try {
      oracleService = serviceFactory.createOracleService();
      console.log(`Oracle service initialized (using ${serviceFactory.isUsingMocks() ? 'mock' : 'real'} implementation)`);
    } catch (error) {
      console.error('Failed to initialize Oracle service:', error);
      return res.status(500).json({ 
        error: 'Failed to initialize Oracle service. Check your configuration.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  next();
};

// Health check endpoint
router.get("/health", ensureOracleService, async (_req: Request, res: Response) => {
  try {
    const health = await oracleService!.getHealth();
    res.json(health);
  } catch (error: any) {
    console.error('Error checking Oracle service health:', error);
    res.status(500).json({ 
      error: 'Failed to check service health',
      details: error.message 
    });
  }
});

// Get compartments
router.get("/compartments", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { tenancyId } = req.query;

    if (!tenancyId) {
      return res.status(400).json({ error: 'tenancyId query parameter is required' });
    }

    const compartments = await oracleService!.getCompartments(tenancyId as string);
    res.json(compartments);
  } catch (error: any) {
    console.error('Error getting compartments:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve compartments',
      details: error.message 
    });
  }
});

// Get compute instances
router.get("/compute/instances", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { compartmentId, availabilityDomain, displayName, state, limit, page } = req.query;

    if (!compartmentId) {
      return res.status(400).json({ error: 'compartmentId query parameter is required' });
    }

    const instances = await oracleService!.getComputeInstances({
      compartmentId: compartmentId as string,
      availabilityDomain: availabilityDomain as string | undefined,
      displayName: displayName as string | undefined,
      state: state as any,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page as string | undefined,
    });

    res.json(instances);
  } catch (error: any) {
    console.error('Error getting compute instances:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve compute instances',
      details: error.message 
    });
  }
});

// Get a specific compute instance
router.get("/compute/instances/:instanceId", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { instanceId } = req.params;

    if (!instanceId) {
      return res.status(400).json({ error: 'instanceId is required' });
    }

    const instance = await oracleService!.getComputeInstance(instanceId);
    res.json(instance);
  } catch (error: any) {
    console.error('Error getting compute instance:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve compute instance',
      details: error.message 
    });
  }
});

// Get block volumes
router.get("/storage/volumes", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { compartmentId, availabilityDomain, displayName, state, limit, page } = req.query;

    if (!compartmentId) {
      return res.status(400).json({ error: 'compartmentId query parameter is required' });
    }

    const volumes = await oracleService!.getVolumes({
      compartmentId: compartmentId as string,
      availabilityDomain: availabilityDomain as string | undefined,
      displayName: displayName as string | undefined,
      state: state as any,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page as string | undefined,
    });

    res.json(volumes);
  } catch (error: any) {
    console.error('Error getting volumes:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve volumes',
      details: error.message 
    });
  }
});

// Get a specific volume
router.get("/storage/volumes/:volumeId", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { volumeId } = req.params;

    if (!volumeId) {
      return res.status(400).json({ error: 'volumeId is required' });
    }

    const volume = await oracleService!.getVolume(volumeId);
    res.json(volume);
  } catch (error: any) {
    console.error('Error getting volume:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve volume',
      details: error.message 
    });
  }
});

// Get Virtual Cloud Networks
router.get("/networking/vcns", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { compartmentId, displayName, state, limit, page } = req.query;

    if (!compartmentId) {
      return res.status(400).json({ error: 'compartmentId query parameter is required' });
    }

    const vcns = await oracleService!.getVcns({
      compartmentId: compartmentId as string,
      displayName: displayName as string | undefined,
      state: state as any,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page as string | undefined,
    });

    res.json(vcns);
  } catch (error: any) {
    console.error('Error getting VCNs:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve VCNs',
      details: error.message 
    });
  }
});

// Get a specific VCN
router.get("/networking/vcns/:vcnId", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { vcnId } = req.params;

    if (!vcnId) {
      return res.status(400).json({ error: 'vcnId is required' });
    }

    const vcn = await oracleService!.getVcn(vcnId);
    res.json(vcn);
  } catch (error: any) {
    console.error('Error getting VCN:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve VCN',
      details: error.message 
    });
  }
});

// Get database systems
router.get("/database/systems", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { compartmentId, displayName, state, limit, page } = req.query;

    if (!compartmentId) {
      return res.status(400).json({ error: 'compartmentId query parameter is required' });
    }

    const databases = await oracleService!.getDatabaseSystems({
      compartmentId: compartmentId as string,
      displayName: displayName as string | undefined,
      state: state as any,
      limit: limit ? parseInt(limit as string) : undefined,
      page: page as string | undefined,
    });

    res.json(databases);
  } catch (error: any) {
    console.error('Error getting database systems:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve database systems',
      details: error.message 
    });
  }
});

// Get a specific database system
router.get("/database/systems/:dbSystemId", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { dbSystemId } = req.params;

    if (!dbSystemId) {
      return res.status(400).json({ error: 'dbSystemId is required' });
    }

    const database = await oracleService!.getDatabaseSystem(dbSystemId);
    res.json(database);
  } catch (error: any) {
    console.error('Error getting database system:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve database system',
      details: error.message 
    });
  }
});

// Get metrics
router.post("/metrics", ensureOracleService, async (req: Request, res: Response) => {
  try {
    const { compartmentId, namespace, query, startTime, endTime, resolution } = req.body;

    if (!compartmentId || !namespace || !query) {
      return res.status(400).json({ error: 'compartmentId, namespace, and query are required' });
    }

    const metrics = await oracleService!.getMetrics({
      compartmentId,
      namespace,
      query,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      resolution,
    });

    res.json(metrics);
  } catch (error: any) {
    console.error('Error getting metrics:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve metrics',
      details: error.message 
    });
  }
});

export default router;
