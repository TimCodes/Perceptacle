# schema.ts

**Path**: `packages/server/db/schema.ts`

## Overview

Database configuration and schema

### Purpose
This file is part of the server application.

### Dependencies
- import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, real, index } from 'drizzle-orm/pg-core';
- import { relations } from 'drizzle-orm';

### Exports
- `export const telemetryMaps = pgTable('telemetry_maps', {`
- `export const telemetryMapNodes = pgTable('telemetry_map_nodes', {`
- `export const telemetryMapConnections = pgTable('telemetry_map_connections', {`
- `export const telemetryMapsRelations = relations(telemetryMaps, ({ many }) => ({`
- `export const telemetryMapNodesRelations = relations(telemetryMapNodes, ({ one }) => ({`

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TypeScript  
**Lines of Code**: 77  
**Last Updated**: January 2026
