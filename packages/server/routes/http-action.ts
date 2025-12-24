
import { Router, type Request, Response } from "express";
import { serviceFactory } from "../services/service-factory";

const router = Router();

// Execute a generic HTTP action
router.post("/execute", async (req: Request, res: Response) => {
    try {
        const { url, method, headers, body } = req.body;

        if (!url || !method) {
            return res.status(400).json({ error: 'URL and Method are required' });
        }

        const httpActionService = serviceFactory.createHttpActionService();
        const result = await httpActionService.executeRequest({
            url,
            method,
            headers,
            body
        });

        res.json(result);
    } catch (error: any) {
        console.error('Error executing HTTP action route:', error);
        res.status(500).json({
            error: 'Failed to execute HTTP action',
            details: error.message
        });
    }
});

export default router;
