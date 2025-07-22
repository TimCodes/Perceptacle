# GitHub Manager System Diagram Application
A modern monorepo web application for creating and managing system diagrams for Google Cloud Platform infrastructure with GitHub integration and advanced node type management.

## 🏗️ Architecture Overview

This project showcases a production-ready monorepo structure with three core packages optimized for cloud infrastructure diagramming:

- **@github-manager/client** - React frontend with advanced diagramming capabilities
- **@github-manager/server** - Express.js API backend for diagram management
- **@github-manager/core** - Shared utilities, types, and validation schemas

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Manager Application               │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + Vite)          │  Backend (Express.js)   │
│  ┌─────────────────────────────┐   │  ┌─────────────────────┐│
│  │ • React Flow Diagrams       │   │  │ • REST API          ││
│  │ • Custom Node Types         │   │  │ • Diagram Storage   ││
│  │ • GitHub Integration        │   │  │ • Node Type CRUD    ││
│  │ • Component Suggestions     │   │  │ • Health Checks     ││
│  │ • Dark/Light Theme          │   │  │ • CORS Support      ││
│  └─────────────────────────────┘   │  └─────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│                   Shared Core Package                      │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ • TypeScript Types • Validation Schemas • Utilities   ││
│  │ • Constants • API Interfaces • Common Business Logic ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 📦 Package Structure

```
github-manager/
├── packages/
│   ├── client/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/  # React components
│   │   │   ├── pages/      # Application pages
│   │   │   ├── utils/      # Client utilities
│   │   │   └── hooks/      # Custom React hooks
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   ├── server/              # Express.js backend API
│   │   ├── src/
│   │   │   ├── routes/     # API route handlers
│   │   │   └── index.ts    # Server entry point
│   │   ├── Dockerfile
│   │   └── package.json
│   └── core/               # Shared utilities library
│       ├── src/
│       │   ├── types/      # TypeScript interfaces
│       │   ├── schemas/    # Validation schemas
│       │   ├── utils/      # Shared utilities
│       │   └── constants/  # Application constants
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml       # Production orchestration
├── docker-compose.dev.yml  # Development orchestration
└── package.json            # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 9+

### Development Setup

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd github-manager
npm install
```

2. **Start development servers:**
```bash
npm run dev
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## ✨ Features & Functionality

### 🎨 Interactive Diagram Canvas
- **React Flow Integration**: Drag-and-drop interface for creating system diagrams
- **Custom Node Types**: Extensible node system with predefined GCP components
- **Real-time Updates**: Live diagram editing with instant visual feedback
- **Export/Import**: Save and load diagram configurations

### 🔧 Node Type Management
- **Predefined Components**: Pre-built GCP service nodes (Compute Engine, Cloud SQL, etc.)
- **Custom Node Creation**: Create custom node types with configurable fields
- **Field Configuration**: Support for text, number, select, textarea, and URL field types
- **Category Organization**: Organize nodes by categories (Compute, Storage, Database, etc.)

### 🎯 Smart Suggestions
- **Architecture Recommendations**: AI-powered suggestions for complementary services
- **Best Practices**: Contextual recommendations based on current diagram structure
- **Missing Component Detection**: Identify gaps in your architecture

### 🌙 User Experience
- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Optimized for desktop and tablet experiences
- **Keyboard Shortcuts**: Efficient diagram creation with keyboard navigation
- **Toast Notifications**: User-friendly feedback for all actions

### 🔗 GitHub Integration
- **Issue Tracking**: View and manage GitHub issues directly from diagram nodes
- **CI/CD Pipeline Visualization**: Monitor build and deployment statuses
- **Repository Linking**: Connect diagram components to GitHub repositories

### 📊 Observability & Monitoring
- **Metrics Dashboard**: View performance metrics for each component
- **Log Aggregation**: Centralized logging for troubleshooting
- **Health Monitoring**: Real-time status indicators for services

## 🛠️ Development Workflow

### NPM Workspace Commands

```bash
# Install dependencies for all packages
npm install

# Run development servers for all packages
npm run dev

# Build all packages for production
npm run build

# Work with specific packages
npm run dev:client    # Client only
npm run dev:server    # Server only
npm run build:core    # Core package only
```

### Package-Specific Development

```bash
# Client development
cd packages/client
npm run dev

# Server development
cd packages/server
npm run dev

# Core library development
cd packages/core
npm run build
```

## 📁 Package Details

### @github-manager/client
**Technologies**: React 18, Vite, TypeScript, Tailwind CSS, React Flow

**Key Features**:
- Modern React hooks and functional components
- Interactive diagram canvas with React Flow
- Responsive UI with Tailwind CSS
- Custom node type management interface
- GitHub integration dashboard
- Theme switching capabilities

**Components**:
- `DiagramCanvas` - Main diagramming interface
- `NodeInfoSideBar` - Detailed node information panel
- `NodeTypeDropdown` - Component selection interface
- `CustomFieldsSection` - Dynamic form field management

### @github-manager/server
**Technologies**: Express.js, TypeScript, CORS

**Key Features**:
- RESTful API for diagram management
- Node type CRUD operations
- Session and data persistence
- Health check endpoints
- CORS configuration for frontend integration

**API Endpoints**:
- `/api/diagrams` - Diagram management
- `/api/node-types` - Custom node type operations
- `/api/health` - Service health monitoring

### @github-manager/core
**Technologies**: TypeScript, Zod for validation

**Key Features**:
- Shared TypeScript interfaces and types
- Validation schemas for data integrity
- Common utility functions
- Application constants and enums
- Cross-package type safety

**Exports**:
- `DiagramNode`, `NodeType`, `CustomField` interfaces
- Validation schemas for API requests
- Utility functions for data transformation
- Constants for node categories and field types

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3001

# Client Configuration
VITE_API_URL=http://localhost:3001

# Application Configuration
VITE_APP_TITLE=GitHub Manager
```

## 🚀 Deployment on Replit

This application is optimized for deployment on Replit:

1. **Fork the Repl** or import from GitHub
2. **Install dependencies**: Run `npm install`
3. **Start the application**: Click the Run button or use `npm run dev`
4. **Access your app**: Use the provided Replit URL

### Replit-Specific Features
- Automatic package detection and installation
- Built-in environment variable management
- Integrated development and deployment workflow
- Port forwarding to make your app accessible

## 📋 Usage Instructions

### Creating Your First Diagram

1. **Start with the Canvas**: Navigate to the home page to see the diagram canvas
2. **Add Components**: Use the component panel to drag GCP services onto the canvas
3. **Configure Nodes**: Click on any node to view and edit its properties
4. **Connect Services**: Draw connections between related components
5. **Save Your Work**: Diagrams are automatically saved to local storage

### Managing Custom Node Types

1. **Navigate to Node Types**: Use the "Node Types" link in the navigation
2. **Create New Types**: Click "Create New Type" to define custom components
3. **Add Custom Fields**: Configure form fields specific to your component
4. **Use in Diagrams**: New types will appear in the component panel

### GitHub Integration

1. **Connect Repositories**: Link diagram nodes to GitHub repositories
2. **Monitor Issues**: View open issues and their status
3. **Track CI/CD**: Monitor build and deployment pipelines
4. **Manage Tickets**: Create and update tickets directly from the diagram

## 🔍 Monitoring & Health Checks

### Application Health
- **Frontend Health**: Automatic connection status monitoring
- **API Health**: `GET /api/health` endpoint
- **Service Status**: Real-time status indicators in the UI

### Development Debugging
```bash
# Check application logs
npm run dev

# Monitor specific package
npm run dev:client --verbose
```

## 🏆 Architecture Benefits

### Monorepo Advantages
- **Shared Dependencies**: Consistent package versions across all services
- **Type Safety**: End-to-end TypeScript type checking
- **Code Reuse**: Common utilities shared between frontend and backend
- **Atomic Changes**: Cross-package updates in single commits
- **Simplified Development**: Single repository for all services

### Scalability Features
- **Component Extensibility**: Easy addition of new node types and features
- **API Modularity**: RESTful design for easy integration
- **State Management**: Efficient client-side state handling
- **Performance Optimization**: Code splitting and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code patterns
4. Test your changes with `npm run dev`
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📚 Additional Resources

- [React Flow Documentation](https://reactflow.dev/)
- [Vite Build Tool](https://vitejs.dev/)
- [Express.js Framework](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Built with ❤️ for modern cloud infrastructure diagramming**