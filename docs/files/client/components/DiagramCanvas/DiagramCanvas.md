# DiagramCanvas.tsx

**Path**: `packages/client/src/components/DiagramCanvas/DiagramCanvas.tsx`

## Overview

React component for UI presentation

### Purpose
This file is part of the client application.

### Dependencies
- import { useCallback, useState, useEffect, useRef } from "react";
- import { useDiagramStore } from "@/utils/diagram-store";
- import { getCloudComponents } from "@/utils/cloudComponents";
- import { SaveMapDialog } from "@/components/SaveMapDialog";
- import { TelemetryMapsLibrary } from "@/components/TelemetryMapsLibrary";
- import { TelemetryMapService } from "@/services/telemetryMapService";
- import { TelemetryMap, ReactFlowNode, ReactFlowEdge } from "@/types/telemetryMap";
- import { useToast } from "@/hooks/use-toast";

### Exports
- `export default function DiagramCanvas({ onNodeSelected, saveTriggered, onSaveComplete, loadTriggered, onLoadComplete }: DiagramCanvasProps) {`

---

## Components

### `DiagramCanvas`

**Description**:  
React component - DiagramCanvas.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `getStatusColor(status: string)`

**Description**:  
getStatusColor function.

**Parameters**:
- `status: string` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `CustomNode({ data }: { data: any })`

**Description**:  
CustomNode function.

**Parameters**:
- `{ data }: { data: any }` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleLoadMap(map: TelemetryMap)`

**Description**:  
handleLoadMap function.

**Parameters**:
- `map: TelemetryMap` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `DiagramCanvas({ onNodeSelected, saveTriggered, onSaveComplete, loadTriggered, onLoadComplete }: DiagramCanvasProps)`

**Description**:  
DiagramCanvas function.

**Parameters**:
- `{ onNodeSelected, saveTriggered, onSaveComplete, loadTriggered, onLoadComplete }: DiagramCanvasProps` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 507  
**Last Updated**: January 2026
