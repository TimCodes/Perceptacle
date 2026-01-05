# App.tsx

**Path**: `packages/client/src/App.tsx`

## Overview

Root application component

### Purpose
This file is part of the client application.

### Dependencies
- import { Switch, Route } from "wouter";
- import { queryClient } from "@/utils/queryClient";
- import { QueryClientProvider } from "@tanstack/react-query";
- import NotFound from "@/pages/not-found";
- import Home from "@/pages/home";
- import Settings from "@/pages/settings";
- import NodeTypes from "@/pages/node-types";
- import { ThemeProvider } from "./utils/theme-provider";
- import DashboardData from "@/pages/dashboard";
- import Navbar from "@/components/NavBar/NavBar";

### Exports
- `export default App;`

---

## Functions

### `Router()`

**Description**:  
Router function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

### `App()`

**Description**:  
App function.

**Parameters**:
- `` - Function parameters (see implementation for types)

**Returns**: See implementation

**Usage Context**: Helper function

---

## Related Files

See [Architecture Documentation](../../architecture.md) for system overview.

---

**File Type**: TSX Component  
**Lines of Code**: 37  
**Last Updated**: January 2026
