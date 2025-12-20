import { Router, type Request, Response } from "express";
import { AzureService, MockAzureService } from "../../services";

const router = Router();

export function createResourcesRouter(azureService: AzureService | MockAzureService) {
  // Get all Azure resources
  router.get("/", async (req: Request, res: Response) => {
    try {
      const queryParams = {
        resourceGroup: req.query.resourceGroup as string,
        location: req.query.location as string,
        resourceType: req.query.resourceType as string,
        tagName: req.query.tagName as string,
        tagValue: req.query.tagValue as string,
      };

      const resources = await azureService.listResources(queryParams);
      res.json(resources);
    } catch (error: any) {
      console.error('Error getting Azure resources:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve Azure resources',
        details: error.message 
      });
    }
  });

  // Get specific Azure resource
  router.get("/:resourceId(*)", async (req: Request, res: Response) => {
    try {
      const resourceId = req.params.resourceId;
      
      if (!resourceId) {
        return res.status(400).json({ error: 'Resource ID is required' });
      }

      const resource = await azureService.getResource(resourceId);
      res.json(resource);
    } catch (error: any) {
      console.error('Error getting Azure resource:', error);
      res.status(500).json({ 
        error: 'Failed to retrieve Azure resource',
        details: error.message 
      });
    }
  });

  return router;
}

export default createResourcesRouter;
