# GCP System Diagram Builder - Frontend React Application

## Overview

This is a React-based frontend application for creating and managing system diagrams specifically for Google Cloud Platform (GCP) components. The application provides an interactive diagram canvas with drag-and-drop functionality, component libraries, and comprehensive node management capabilities. It features a modern tech stack with TypeScript, React Flow for diagram visualization, shadcn/ui components, and Tailwind CSS for styling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom theme system
- **Diagram Engine**: React Flow for interactive canvas and node management
- **State Management**: Zustand for diagram state and React Query for server state
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Development**: Vite middleware integration for hot module replacement
- **Database**: Drizzle ORM configured for PostgreSQL (schema ready but not implemented)
- **API Structure**: RESTful endpoints with `/api` prefix routing

## Key Components

### Diagram Canvas System
- **Interactive Canvas**: React Flow-powered diagram editor with pan, zoom, and selection
- **Node System**: Custom GCP component nodes with visual status indicators
- **Connection System**: Edge creation between components with arrow markers
- **Component Library**: Categorized GCP services (Compute, Storage, Database, Networking, etc.)

### Component Management
- **Drag & Drop**: Components can be dragged from library to canvas
- **Search & Filter**: Real-time component searching with Fuse.js fuzzy search
- **Custom Fields**: Dynamic property panels for component configuration
- **Status Management**: Visual status indicators (active, warning, error, inactive)

### User Interface
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme System**: Dark/light mode with custom color schemes
- **Navigation**: Clean navbar with settings and component library access
- **Sidebar Panels**: Configurable node information panels with tabs

### Node Information System
- **Configuration Tab**: Basic properties, status, and custom fields
- **CI/CD Tab**: Repository integration and GitHub issues display
- **Observability Tab**: Metrics visualization with progress indicators
- **Tickets Tab**: Trouble ticket management and tracking

## Data Flow

### Diagram State Management
1. **Central Store**: Zustand store manages nodes, edges, and selected node state
2. **Local Storage**: Diagrams persist in browser localStorage
3. **Real-time Updates**: Immediate UI updates on state changes
4. **Event Handling**: React Flow events trigger state updates

### Component Interaction Flow
1. User selects component from dropdown library
2. Component dragged to canvas triggers node creation
3. Node selection opens configuration sidebar
4. Property changes update both local state and visual representation
5. Diagram save/load operations interact with localStorage

### Search and Suggestions
1. Component search uses Fuse.js for fuzzy matching
2. AI-powered suggestions analyze current diagram composition
3. Missing component recommendations based on architecture patterns

## External Dependencies

### Core Libraries
- **React Flow**: Diagram canvas and node management
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Framer Motion**: Animation library for smooth transitions
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching

### Development Tools
- **TypeScript**: Type safety and developer experience
- **Vite**: Fast build tool and development server
- **Jest**: Testing framework with React Testing Library
- **ESBuild**: Fast JavaScript bundler for production

### UI Components
- **shadcn/ui**: Pre-built accessible components
- **Lucide React**: Icon library for consistent iconography
- **cmdk**: Command palette functionality
- **date-fns**: Date manipulation utilities

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **TypeScript Compilation**: Real-time type checking and compilation
- **CSS Processing**: PostCSS with Tailwind CSS compilation

### Production Build
- **Frontend Build**: Vite builds optimized React bundle to `dist/public`
- **Backend Build**: ESBuild compiles server code to `dist/index.js`
- **Static Assets**: All frontend assets served from Express in production
- **Environment Configuration**: Environment variables for database and API configuration

### Database Integration (Prepared)
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **Migration System**: Database schema versioning with `drizzle-kit`
- **Connection Management**: Environment-based database URL configuration
- **Schema Definition**: Structured schema files in `/db` directory

The application is currently frontend-focused with local storage persistence, but includes complete backend infrastructure for future API integration and database storage.