# routes.ts

**Path**: `packages/server/routes.ts`

## Overview

Application module

### Purpose
This file is part of the server application.

### Dependencies
- import type { Express } from "express";
- import { createServer, type Server } from "http";
- import azureRoutes from "./routes/azure";
- import kubernetesRoutes from "./routes/kubernetes";
- import githubRoutes from "./routes/github";
- import oracleRoutes from "./routes/oracle";
- import agentsRoutes from "./routes/agents";
- import mongodbRoutes from "./routes/mongodb";
- import ragRoutes from "./routes/rag";
- import telemetryMapsRoutes from "./routes/telemetryMaps";

### Exports
- `export function registerRoutes(app: Express): Server {`

---

## Functions

### `registerRoutes(app: Express)`

**Description**:  
registerRoutes function.

**Parameters**:
- `app: Express` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `registerRoutes(app: Express)`

**Description**:  
registerRoutes function.

**Parameters**:
- `app: Express` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 48  
**Last Updated**: January 2026
