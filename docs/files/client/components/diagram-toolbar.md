# diagram-toolbar.tsx

**Path**: `packages/client/src/components/diagram-toolbar.tsx`

## Overview

React component for UI presentation

### Purpose
This file is part of the client application.

### Dependencies
- import { Button } from "@/components/ui/button";
- import { Plus, Search, Sparkles } from "lucide-react";
- import { useCallback, useState, useEffect } from "react";
- import { useDiagramStore } from "@/utils/diagram-store";
- import { useToast } from "@/hooks/use-toast";
- import Fuse from "fuse.js";
- import { getComponentSuggestions } from "@/utils/suggestions";

### Exports
- `export default function DiagramToolbar() {`

---

## Components

### `DiagramToolbar`

**Description**:  
React component - DiagramToolbar.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `down(e: KeyboardEvent)`

**Description**:  
down function.

**Parameters**:
- `e: KeyboardEvent` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleSearch(value: string)`

**Description**:  
handleSearch function.

**Parameters**:
- `value: string` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleNodeSelect(node: any)`

**Description**:  
handleNodeSelect function.

**Parameters**:
- `node: any` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleGetSuggestions()`

**Description**:  
handleGetSuggestions function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `DiagramToolbar()`

**Description**:  
DiagramToolbar function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 194  
**Last Updated**: January 2026
