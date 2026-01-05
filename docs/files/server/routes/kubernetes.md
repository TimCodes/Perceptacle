# kubernetes.ts

**Path**: `packages/server/routes/kubernetes.ts`

## Overview

API route handler providing REST endpoints

### Purpose
This file is part of the server application.

### Dependencies
- import { Router, Request, Response } from 'express';
- import { serviceFactory } from '../services/service-factory';
- import { KubernetesService, MockKubernetesService } from '../services';

### Exports
- `export default router;`

---

## Functions

### `ensureKubernetesService(req: Request, res: Response, next: any)`

**Description**:  
ensureKubernetesService function.

**Parameters**:
- `req: Request, res: Response, next: any` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 291  
**Last Updated**: January 2026
