# index.ts

**Path**: `packages/server/index.ts`

## Overview

Module entry point and exports

### Purpose
This file is part of the server application.

### Dependencies
- import express, { type Request, Response, NextFunction } from "express";
- import cors from "cors";
- import { config } from "dotenv";
- import { registerRoutes } from "./routes";

### Exports
None (internal module)

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

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 89  
**Last Updated**: January 2026
