# node-types.tsx

**Path**: `packages/client/src/pages/node-types.tsx`

## Overview

Page component for application routing

### Purpose
This file is part of the client application.

### Dependencies
- import { useState } from "react";
- import { Button } from "@/components/ui/button";
- import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
- import { Input } from "@/components/ui/input";
- import { Label } from "@/components/ui/label";
- import { ArrowLeft, Plus, Trash2, ChevronRight } from "lucide-react";
- import { useLocation } from "wouter";
- import { cloudComponents } from "@/utils/cloudComponents";
- import { ScrollArea } from "@/components/ui/scroll-area";
- import { Badge } from "@/components/ui/badge";

### Exports
- `export default function NodeTypes() {`

---

## Components

### `NodeTypes`

**Description**:  
React component - NodeTypes.

**Props**: See component implementation for detailed prop types.

**Returns**: `JSX.Element`

---

## Functions

### `toggleFieldConfig(fieldId: string)`

**Description**:  
toggleFieldConfig function.

**Parameters**:
- `fieldId: string` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `addField()`

**Description**:  
addField function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `updateField(id: string, updates: Partial<CustomField>)`

**Description**:  
updateField function.

**Parameters**:
- `id: string, updates: Partial<CustomField>` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `removeField(id: string)`

**Description**:  
removeField function.

**Parameters**:
- `id: string` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `renderFieldPreview(field: CustomField)`

**Description**:  
renderFieldPreview function.

**Parameters**:
- `field: CustomField` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `renderFieldConfiguration(field: CustomField)`

**Description**:  
renderFieldConfiguration function.

**Parameters**:
- `field: CustomField` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `handleCreateComponent()`

**Description**:  
handleCreateComponent function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `NodeTypes()`

**Description**:  
NodeTypes function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 570  
**Last Updated**: January 2026
