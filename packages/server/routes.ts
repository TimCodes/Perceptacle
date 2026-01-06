/**
 * API route registration - mounts all API endpoints.
 * Returns HTTP server instance for WebSocket support.
 */
import type { Express } from "express";
import { createServer, type Server } from "http";
import azureRoutes from "./routes/azure";
import kubernetesRoutes from "./routes/kubernetes";
import githubRoutes from "./routes/github";
import oracleRoutes from "./routes/oracle";
import agentsRoutes from "./routes/agents";
import mongodbRoutes from "./routes/mongodb";
import ragRoutes from "./routes/rag";
import telemetryMapsRoutes from "./routes/telemetryMaps";
import kafkaRoutes from "./routes/kafka";
import httpActionRoutes from "./routes/http-action";
import docsRoutes from "./routes/docs";

/** Registers all API routes and returns HTTP server */
export function registerRoutes(app: Express): Server {
  // Register Azure routes
  app.use("/api/azure", azureRoutes);

  // Register Kubernetes routes
  app.use("/api/kubernetes", kubernetesRoutes);

  // Register GitHub routes
  app.use("/api/github", githubRoutes);

  // Register Oracle routes
  app.use("/api/oracle", oracleRoutes);

  // Register Agents routes
  app.use("/api/agents", agentsRoutes);

  // Register MongoDB routes
  app.use("/api/mongodb", mongodbRoutes);

  // Register RAG routes
  app.use("/api/rag", ragRoutes);

  // Register Telemetry Maps routes
  app.use("/api/telemetry-maps", telemetryMapsRoutes);

  // Register Kafka routes
  app.use("/api/kafka", kafkaRoutes);

  // Register HTTP action routes
  app.use("/api/actions/http", httpActionRoutes);

  // Register documentation routes
  app.use("/docs", docsRoutes);

  const httpServer = createServer(app);

  return httpServer;
}
