# home.tsx

**Path**: `packages/client/src/pages/home.tsx`

## Overview

Page component for application routing

### Purpose
This file is part of the client application.

### Dependencies
- import { useState } from "react";
- import DiagramCanvas from "@/components//DiagramCanvas/DiagramCanvas";
- import DropDown from "@/components/NodeTypeDropdown/DropDown";
- import { ReactFlowProvider } from "reactflow";
- import { ChevronLeft, ChevronRight } from "lucide-react";
- import { motion, AnimatePresence } from "framer-motion";
- import { Button } from "@/components/ui/button";
- import { cn } from "@/utils/cn";
- import NodeInfoSideBar from "@/components/NodeInfoSideBar/NodeInfoSideBar";
- import DiagramToolbar from "@/components/DiagramCanvas/DiagramToolbar";

### Exports
- `export default function Home() {`

---

## Components

### `Home`

**Description**:  
React component - Home.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `handleNodeSelected()`

**Description**:  
handleNodeSelected function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleComponentSelect(component: any)`

**Description**:  
handleComponentSelect function.

**Parameters**:
- `component: any` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `triggerSave()`

**Description**:  
triggerSave function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `onSaveComplete()`

**Description**:  
onSaveComplete function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `triggerLoad()`

**Description**:  
triggerLoad function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `onLoadComplete()`

**Description**:  
onLoadComplete function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `Home()`

**Description**:  
Home function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 103  
**Last Updated**: January 2026
