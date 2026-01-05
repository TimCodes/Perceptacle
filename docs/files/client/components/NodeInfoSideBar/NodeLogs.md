# NodeLogs.tsx

**Path**: `packages/client/src/components/NodeInfoSideBar/NodeLogs.tsx`

## Overview

React component for UI presentation

### Purpose
This file is part of the client application.

### Dependencies
- import React from "react";
- import { ScrollArea } from "@/components/ui/scroll-area";
- import { Badge } from "@/components/ui/badge";
- import { cn } from "@/utils/cn";
- import { AlertCircle, AlertTriangle, Info } from "lucide-react";

### Exports
- `export const Nodelogs = ({ logs }) => (`
- `export default Nodelogs;`

---

## Components

### `Nodelogs`

**Description**:  
React component - Nodelogs.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `getLogIcon(level)`

**Description**:  
getLogIcon function.

**Parameters**:
- `level` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `Nodelogs({ logs })`

**Description**:  
Nodelogs function.

**Parameters**:
- `{ logs }` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 51  
**Last Updated**: January 2026
