import { Router, type Request, Response } from "express";
import { AzureService, MockAzureService } from "../../services";

const router = Router();

export function createMetricsRouter(azureService: AzureService | MockAzureService) {
  // Get metrics for an Azure resource
  router.get("/:resourceId(*)/metrics", async (req: Request, res: Response) => {
    try {
      const resourceId = req.params.resourceId;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const metricParams = {
        resourceId,
        timespan: req.query.timespan as string,
        interval: req.query.interval as string,
        metricNames: req.query.metricNames ? (req.query.metricNames as string).split(',') : undefined,
        aggregation: req.query.aggregation as string,
      };

      const metrics = await azureService.getMetrics(metricParams);
      res.json(metrics);
    } catch (error: any) {
      console.error('Error getting Azure metrics:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve Azure metrics',
        details: error.message 
      });
    }
  });

  // Get metric definitions for an Azure resource
  router.get("/:resourceId(*)/metric-definitions", async (req: Request, res: Response) => {
    try {
      const resourceId = req.params.resourceId;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const definitions = await azureService.getMetricDefinitions(resourceId);
      res.json(definitions);
    } catch (error: any) {
      console.error('Error getting metric definitions:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve metric definitions',
        details: error.message 
      });
    }
  });

  return router;
}

export default createMetricsRouter;
