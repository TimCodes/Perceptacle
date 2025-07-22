# React System Diagram Creator - Monorepo

## Project Overview
A React-based system diagram creator for Google Cloud components, offering an advanced architectural visualization tool with intelligent design and collaboration capabilities.

This is a monorepo consisting of three packages:
- `@github-manager/client` - React frontend using Vite, running on port 3000
- `@github-manager/server` - Express backend API, running on port 3001  
- `@github-manager/core` - Shared TypeScript types, schemas, and utilities

## Recent Changes
**January 22, 2025**
- ✓ Fixed TypeScript build errors in core package
- ✓ Resolved duplicate type exports between types/index.ts and schemas/index.ts
- ✓ Added browser environment checks for localStorage usage
- ✓ Updated tsconfig.json to include DOM lib for browser APIs
- → Working on fixing workflow configuration and port setup

## Architecture
**Stack:**
- React with TypeScript
- Shadcn-ui components
- React Flow for diagram visualization  
- Zustand for state management
- Express.js API backend
- Zod for schema validation
- Vite for development and building

**Packages:**
- **Client**: React SPA with Vite dev server (port 3000)
- **Server**: Express API server (port 3001) 
- **Core**: Shared utilities, types, and validation schemas

## User Preferences
- Focus on fixing errors and getting the application running smoothly
- Maintain clean TypeScript code without errors
- Keep monorepo structure organized

## Known Issues
- Workflow configured for port 5000 but services use 3000/3001
- Missing Replit-specific vite plugins in root vite.config.ts
- React Flow warning about parent container needing width/height

## Next Steps  
- Fix workflow port configuration
- Address React Flow container sizing warning
- Ensure all packages work together properly