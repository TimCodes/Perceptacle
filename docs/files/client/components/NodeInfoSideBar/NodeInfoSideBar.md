# NodeInfoSideBar.tsx

**Path**: `packages/client/src/components/NodeInfoSideBar/NodeInfoSideBar.tsx`

## Overview

React component for UI presentation

### Purpose
This file is part of the client application.

### Dependencies
- import { useState, useEffect, useRef } from "react";
- import { ScrollArea } from "@/components/ui/scroll-area";
- import { Button } from "@/components/ui/button";
- import { Tabs, TabsContent } from "@/components/ui/tabs";
- import { Save } from "lucide-react";
- import { useDiagramStore } from "@/utils/diagram-store";
- import { useToast } from "@/hooks/use-toast";
- import { TabNavigation } from "./TabNavigation";
- import { ConfigurationTab } from "./ConfigurationTab";
- import CICDTab from "./CICDTab";

### Exports
- `export default function NodeInfoSideBar() {`

---

## Components

### `NodeInfoSideBar`

**Description**:  
React component - NodeInfoSideBar.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `handleChange(field, value)`

**Description**:  
handleChange function.

**Parameters**:
- `field, value` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleCustomFieldChange(fieldName, value)`

**Description**:  
handleCustomFieldChange function.

**Parameters**:
- `fieldName, value` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleSave()`

**Description**:  
handleSave function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `NodeInfoSideBar()`

**Description**:  
NodeInfoSideBar function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 209  
**Last Updated**: January 2026
