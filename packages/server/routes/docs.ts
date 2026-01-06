import { Router, type Request, Response } from "express";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the docs directory
const docsPath = path.resolve(__dirname, "../../docs");
router.use(express.static(docsPath));

// Handle all routes to serve index.html for Docsify
router.get("*", (_req: Request, res: Response) => {
  res.sendFile(path.join(docsPath, "index.html"));
});

export default router;
