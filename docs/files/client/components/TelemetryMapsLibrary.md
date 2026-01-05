# TelemetryMapsLibrary.tsx

**Path**: `packages/client/src/components/TelemetryMapsLibrary.tsx`

## Overview

React component for UI presentation

### Purpose
This file is part of the client application.

### Dependencies
- import { useState, useEffect } from 'react';
- import { Button } from '@/components/ui/button';
- import { Input } from '@/components/ui/input';
- import { Badge } from '@/components/ui/badge';
- import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
- import { TelemetryMap } from '@/types/telemetryMap';
- import { TelemetryMapService } from '@/services/telemetryMapService';
- import { useToast } from '@/hooks/use-toast';

### Exports
- `export function TelemetryMapsLibrary({`

---

## Components

### `TelemetryMapsLibrary`

**Description**:  
React component - TelemetryMapsLibrary.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

### `MapCard`

**Description**:  
React component - MapCard.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `loadMaps()`

**Description**:  
loadMaps function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleDeleteMap(mapId: string)`

**Description**:  
handleDeleteMap function.

**Parameters**:
- `mapId: string` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `filteredMaps(maps: TelemetryMap[])`

**Description**:  
filteredMaps function.

**Parameters**:
- `maps: TelemetryMap[]` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `formatDate(dateString: string)`

**Description**:  
formatDate function.

**Parameters**:
- `dateString: string` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `MapCard({ map, showActions = false }: { map: TelemetryMap; showActions?: boolean })`

**Description**:  
MapCard function.

**Parameters**:
- `{ map, showActions = false }: { map: TelemetryMap; showActions?: boolean }` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 271  
**Last Updated**: January 2026
