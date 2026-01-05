# connection.ts

**Path**: `packages/server/db/connection.ts`

## Overview

Database configuration and schema

### Purpose
This file is part of the server application.

### Dependencies
- import { drizzle } from 'drizzle-orm/postgres-js';
- import postgres from 'postgres';
- import * as schema from './schema.js';

### Exports
- `export const db = drizzle(sql, { schema });`
- `export const closeDatabase = () => {`

---

## Functions

### `closeDatabase()`

**Description**:  
closeDatabase function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 14  
**Last Updated**: January 2026
