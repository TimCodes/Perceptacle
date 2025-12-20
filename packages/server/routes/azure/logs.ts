import { Router, type Request, Response } from "express";
import { AzureService, MockAzureService } from "../../services";

const router = Router();

export function createLogsRouter(azureService: AzureService | MockAzureService) {
  // Get logs for an Azure resource
  router.post("/:resourceId(*)/logs", async (req: Request, res: Response) => {
    try {
      const resourceId = req.params.resourceId;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const { query, timespan, workspaceId } = req.body;
      
      if (!query) {
        return res.status(400).json({ error: 'KQL query is required' });
      }

      if (!workspaceId) {
        return res.status(400).json({ error: 'Log Analytics workspace ID is required' });
      }

      const logParams = {
        resourceId,
        query,
        timespan,
        workspaceId
      };

      const logs = await azureService.getLogs(logParams);
      res.json(logs);
    } catch (error: any) {
      console.error('Error getting Azure logs:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve Azure logs',
        details: error.message 
      });
    }
  });

  // Get diagnostic settings for a resource
  router.get("/:resourceId(*)/diagnostic-settings", async (req: Request, res: Response) => {
    try {
      const resourceId = req.params.resourceId;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const settings = await azureService.getDiagnosticSettings(resourceId);
      res.json(settings);
    } catch (error: any) {
      console.error('Error getting diagnostic settings:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve diagnostic settings',
        details: error.message 
      });
    }
  });

  return router;
}

export default createLogsRouter;
