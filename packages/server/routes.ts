import type { Express } from "express";
import { createServer, type Server } from "http";
import azureRoutes from "./routes/azure";

export function registerRoutes(app: Express): Server {
  // Register Azure routes
  app.use("/api/azure", azureRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
