import type { Express } from "express";
import { createServer, type Server } from "http";
import azureRoutes from "./routes/azure";
import kubernetesRoutes from "./routes/kubernetes";

export function registerRoutes(app: Express): Server {
  // Register Azure routes
  app.use("/api/azure", azureRoutes);
  
  // Register Kubernetes routes
  app.use("/api/kubernetes", kubernetesRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
