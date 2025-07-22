
# GitHub Manager Monorepo
A modern monorepo web application for creating and managing system diagrams for Google Cloud Platform (GCP) services. Built with React, Express.js, and TypeScript in a scalable monorepo architecture.

## 🏗️ Architecture Overview

This project demonstrates a production-ready monorepo structure with three core packages:

- **@github-manager/client** - React frontend with Vite build system and React Flow
- **@github-manager/server** - Express.js API backend with TypeScript  
- **@github-manager/core** - Shared utilities, types, and common functionality

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                     │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              React + TypeScript                         │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │ Diagram     │ │ Node Types  │ │ Component       │   │ │
│  │  │ Canvas      │ │ Manager     │ │ Library         │   │ │
│  │  │ (React Flow)│ │             │ │ (GCP Services)  │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ HTTP/REST API
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Port 5000)                      │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Express.js + TypeScript                    │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │ Diagram     │ │ Node Types  │ │ Custom Component│   │ │
│  │  │ Management  │ │ CRUD API    │ │ Storage         │   │ │
│  │  │ Routes      │ │             │ │                 │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                │ Shared Types & Utils
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Core Package                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Shared Library                             │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐   │ │
│  │  │ TypeScript  │ │ Validation  │ │ Utility         │   │ │
│  │  │ Interfaces  │ │ Schemas     │ │ Functions       │   │ │
│  │  │ & Types     │ │ (Zod)       │ │                 │   │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Package Structure

```
github-manager-monorepo/
├── packages/
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── pages/       # Application pages
│   │   │   ├── utils/       # Client-specific utilities
│   │   │   └── hooks/       # React hooks
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   ├── server/              # Express.js backend API
│   │   ├── src/
│   │   │   ├── routes/      # API route handlers
│   │   │   └── index.ts     # Server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── core/                # Shared utilities library
│       ├── src/
│       │   ├── types/       # TypeScript interfaces
│       │   ├── schemas/     # Validation schemas
│       │   ├── utils/       # Shared utilities
│       │   └── constants/   # Application constants
│       ├── package.json
│       └── tsconfig.json
├── nginx/                   # Reverse proxy configuration
├── docker-compose.yml       # Production orchestration
├── docker-compose.dev.yml   # Development orchestration
└── package.json             # Workspace configuration
```

## ✨ Features & Functionality

### 🎨 Diagram Canvas
- **Interactive Diagram Creation**: Drag-and-drop interface using React Flow
- **GCP Component Library**: Pre-built components for Google Cloud services
- **Custom Node Types**: Create and manage custom component types
- **Real-time Updates**: Live editing with immediate visual feedback
- **Export/Import**: Save and load diagram configurations

### 🔧 Node Management
- **Dynamic Properties**: Configure node-specific properties and settings
- **Custom Fields**: Add custom fields to component types with validation
- **Category Organization**: Organize components by service categories
- **Field Type Support**: Text, number, select, textarea, and URL field types

### 🎯 User Interface
- **Modern Design**: Clean, responsive UI built with Tailwind CSS and shadcn/ui
- **Dark/Light Theme**: Theme switching with system preference detection
- **Mobile Responsive**: Optimized for desktop and mobile devices
- **Accessibility**: WCAG compliant interface design

### 🔌 API Integration
- **RESTful API**: Express.js backend with TypeScript
- **Type Safety**: End-to-end type safety with shared types
- **Data Persistence**: Local storage and API-based data management
- **Real-time Sync**: Automatic synchronization between client and server

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd github-manager-monorepo
npm install
```

2. **Build the core package:**
```bash
npm run build:core
```

3. **Start development servers:**
```bash
npm run dev
```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Individual Package Development

You can also run packages individually:

```bash
# Client only
npm run dev:client

# Server only  
npm run dev:server

# Core package only
npm run dev:core
```

## 🐳 Docker Development

### Development Environment
Start all services in development mode with hot reload:

```bash
npm run docker:dev
```

### Production Environment
Build and start production containers:

```bash
npm run docker:prod
```

### Docker Services Architecture

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| nginx | 80, 443 | Reverse proxy & load balancer | /health |
| client | 3000 → 80 | React frontend application | HTTP response |
| server | 5000 | Express.js API backend | /api/health |
| core | N/A | Shared utilities library | Build status |

### Docker Commands

```bash
# Development workflow
docker-compose -f docker-compose.dev.yml up -d

# Production deployment
docker-compose up -d

# View logs
docker-compose logs -f server

# Stop all services
npm run docker:stop

# Clean up containers and images
npm run docker:clean
```

## 📋 Usage Instructions

### Creating Your First Diagram

1. **Start with the Canvas**: Navigate to the home page to see the diagram canvas
2. **Add Components**: Use the component panel to drag GCP services onto the canvas
3. **Configure Nodes**: Click on any node to view and edit its properties
4. **Connect Services**: Draw connections between related components
5. **Save Your Work**: Use the export functionality to save your diagrams

### Managing Node Types

1. **Access Node Types**: Navigate to `/node-types` to manage component types
2. **Create Custom Types**: Use the "Create New Type" dialog to define custom components
3. **Add Custom Fields**: Configure field types, validation, and default values
4. **Preview Components**: See how your custom components will appear in the canvas

### Key Components

- **DiagramCanvas**: Main canvas for creating and editing diagrams
- **NodeInfoSideBar**: Property panel for configuring selected nodes
- **NodeTypes**: Management interface for component types
- **ThemeProvider**: Dark/light theme management

## 🛠️ Technical Stack

### Frontend
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and developer experience
- **Vite**: Fast build tool and development server
- **React Flow**: Graph visualization and diagram creation
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React component library
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching

### Backend
- **Express.js**: Fast, unopinionated web framework
- **TypeScript**: Type-safe server-side development
- **CORS**: Cross-origin resource sharing support
- **Morgan**: HTTP request logging middleware

### Development Tools
- **ESLint**: Code linting and quality enforcement
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Docker**: Containerization and deployment
- **npm Workspaces**: Monorepo package management

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Client Configuration
VITE_API_URL=http://localhost:5000

# Application Configuration
VITE_APP_TITLE=GitHub Manager
```

### Package Scripts

Root package.json scripts for monorepo management:

```json
{
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "dev:client": "npm run dev --workspace=@github-manager/client",
    "dev:server": "npm run dev --workspace=@github-manager/server",
    "dev:core": "npm run dev --workspace=@github-manager/core"
  }
}
```

## 🚀 Deployment on Replit

This application is optimized for deployment on Replit:

1. **Fork the Repl** or import from GitHub
2. **Install dependencies**: Run `npm install`
3. **Build core package**: Run `npm run build:core`
4. **Start the application**: Click the Run button or use `npm run dev`
5. **Access your app**: Use the provided Replit URL

### Replit-Specific Features
- Automatic package detection and installation
- Built-in environment variable management
- Integrated development and deployment workflow
- Port forwarding to make your app accessible

## 🔍 Monitoring & Observability

### Application Logs
- Server request/response logging with Morgan
- Client-side error boundary and logging
- Development console outputs for debugging

### Health Checks
- Server health endpoint: `/api/health`
- Client application status monitoring
- Docker container health checks

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes in the appropriate package
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use shared types from the core package
- Maintain component documentation
- Write tests for new features
- Follow the established code style

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section in this README
2. Review the application logs for error messages
3. Visit our [Community Hub](https://replit.com/community) for additional resources
4. Create an issue in the repository with detailed information

---

**Built with ❤️ using modern web technologies and monorepo architecture patterns.**
