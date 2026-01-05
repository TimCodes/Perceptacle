# vite.ts

**Path**: `packages/server/vite.ts`

## Overview

Application module

### Purpose
This file is part of the server application.

### Dependencies
- import express, { type Express } from "express";
- import fs from "fs";
- import path, { dirname } from "path";
- import { fileURLToPath } from "url";
- import { createServer as createViteServer, createLogger } from "vite";
- import { type Server } from "http";
- import viteConfig from "../client/vite.config";
- import { nanoid } from "nanoid";

### Exports
- `export function log(message: string, source = "express") {`
- `export async function setupVite(app: Express, server: Server) {`
- `export function serveStatic(app: Express) {`

---

## Functions

### `log(message: string, source = "express")`

**Description**:  
log function.

**Parameters**:
- `message: string, source = "express"` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `setupVite(app: Express, server: Server)`

**Description**:  
setupVite function.

**Parameters**:
- `app: Express, server: Server` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `serveStatic(app: Express)`

**Description**:  
serveStatic function.

**Parameters**:
- `app: Express` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `log(message: string, source = "express")`

**Description**:  
log function.

**Parameters**:
- `message: string, source = "express"` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `setupVite(app: Express, server: Server)`

**Description**:  
setupVite function.

**Parameters**:
- `app: Express, server: Server` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `serveStatic(app: Express)`

**Description**:  
serveStatic function.

**Parameters**:
- `app: Express` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 82  
**Last Updated**: January 2026
