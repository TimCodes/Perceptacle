import type { Express } from "express";
import { createServer, type Server } from "http";
import azureRoutes from "./routes/azure";
import kubernetesRoutes from "./routes/kubernetes";
import githubRoutes from "./routes/github";
import telemetryMapsRoutes from "./routes/telemetryMaps";

export function registerRoutes(app: Express): Server {
  // Register Azure routes
  app.use("/api/azure", azureRoutes);
  
  // Register Kubernetes routes
  app.use("/api/kubernetes", kubernetesRoutes);
  
  // Register GitHub routes
  app.use("/api/github", githubRoutes);
  
  // Register Telemetry Maps routes
  app.use("/api/telemetry-maps", telemetryMapsRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
