# dashboard.tsx

**Path**: `packages/client/src/pages/dashboard.tsx`

## Overview

Page component for application routing

### Purpose
This file is part of the client application.

### Dependencies
- import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
- import { Badge } from "@/components/ui/badge";
- import { ScrollArea } from "@/components/ui/scroll-area";
- import { Activity, Cpu, HardDrive, Network, AlertCircle, CheckCircle2 } from "lucide-react";
- import { useDiagramStore } from "@/utils/diagram-store";

### Exports
- `export default function DashboardPage() {`

---

## Components

### `DashboardPage`

**Description**:  
React component - DashboardPage.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

### `MetricCard`

**Description**:  
React component - MetricCard.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `MetricCard({ title, value, subtext, icon: Icon, trend }: any)`

**Description**:  
MetricCard function.

**Parameters**:
- `{ title, value, subtext, icon: Icon, trend }: any` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `DashboardPage()`

**Description**:  
DashboardPage function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 229  
**Last Updated**: January 2026
