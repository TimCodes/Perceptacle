/**
 * API route registration - mounts all API endpoints.
 * Returns HTTP server instance for WebSocket support.
 * 
 * MOCK SERVER MODE: Only Azure and Kubernetes routes enabled
 */
import type { Express } from "express";
import { createServer, type Server } from "http";
import azureRoutes from "./routes/azure";
import kubernetesRoutes from "./routes/kubernetes";
import telemetryMapsRoutes from "./routes/telemetryMaps";
import docsRoutes from "./routes/docs";

/** Registers all API routes and returns HTTP server */
export function registerRoutes(app: Express): Server {
  // Register Azure routes
  app.use("/api/azure", azureRoutes);

  // Register Kubernetes routes
  app.use("/api/kubernetes", kubernetesRoutes);

  // Register Telemetry Maps routes (for diagram storage)
  app.use("/api/telemetry-maps", telemetryMapsRoutes);

  // Register documentation routes
  app.use("/docs", docsRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
