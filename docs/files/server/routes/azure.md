# azure.ts

**Path**: `packages/server/routes/azure.ts`

## Overview

API route handler providing REST endpoints

### Purpose
This file is part of the server application.

### Dependencies
- import { Router, type Request, Response } from "express";
- import { serviceFactory } from "../services/service-factory";
- import { AzureService, MockAzureService } from "../services";

### Exports
- `export default router;`

---

## Functions

### `ensureAzureService(req: Request, res: Response, next: any)`

**Description**:  
ensureAzureService function.

**Parameters**:
- `req: Request, res: Response, next: any` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 347  
**Last Updated**: January 2026
