import type { Express } from "express";
import { createServer, type Server } from "http";
import azureRoutes from "./routes/azure";
import kubernetesRoutes from "./routes/kubernetes";
import telemetryMapsRoutes from "./routes/telemetryMaps";

export function registerRoutes(app: Express): Server {
  // Register Azure routes
  app.use("/api/azure", azureRoutes);
  
  // Register Kubernetes routes
  app.use("/api/kubernetes", kubernetesRoutes);
  
  // Register Telemetry Maps routes
  app.use("/api/telemetry-maps", telemetryMapsRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
