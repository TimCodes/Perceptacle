# Perceptacle Agents Service

Python-based microservice for hosting LangGraph AI agents to provide intelligent troubleshooting and automation capabilities for the Perceptacle platform.

## Overview

The Agents Service is a FastAPI-based microservice that hosts AI agents built with LangGraph. It provides REST API endpoints for agent interactions and is designed to work seamlessly with the Node.js backend server.

### Key Features

- **FastAPI Framework**: High-performance async Python web framework
- **LangGraph Integration**: Ready for advanced agentic workflows (Feature 1.3)
- **Docker Support**: Multi-stage Dockerfile for development and production
- **Health Checks**: Kubernetes-style health, readiness, and liveness probes
- **Hot Reload**: Development mode with automatic code reloading

## Architecture

The Agents Service communicates with the Node.js server via HTTP REST API. The Node.js server acts as a proxy, forwarding requests from the client to the Python agents service.

```
Client (React) → Node.js Server → Python Agents Service
```

## Prerequisites

- Python 3.11 or higher
- pip (Python package manager)
- Docker (for containerized deployment)

## Installation

### Local Development

1. **Navigate to the agents directory**:
   ```bash
   cd packages/agents
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment**:
   - Windows:
     ```bash
     venv\Scripts\activate
     ```
   - macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables** (optional):
   ```bash
   # Copy the example .env file
   cp .env.example .env
   
   # Edit .env with your configuration
   # nano .env  # or use your preferred editor
   ```

### Docker Deployment

The service is automatically built and deployed when using Docker Compose:

```bash
# Development mode
docker-compose -f docker-compose.dev.yml up agents

# Production mode
docker-compose up agents
```

## Running the Service

### Local Development

```bash
# From packages/agents directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The service will be available at `http://localhost:8000`.

### Using Docker

```bash
# From project root
docker-compose -f docker-compose.dev.yml up agents
```

## API Endpoints

### Health Endpoints

- **GET /health**: Main health check endpoint
- **GET /health/ready**: Readiness probe
- **GET /health/live**: Liveness probe

### Agent Endpoints

- **GET /api/agents/status**: Get agent service status
- **POST /api/agents/chat**: Send chat message to agent (Feature 1.3 - Not yet implemented)

## Configuration

The service is configured via environment variables. You can set these in:
- A `.env` file in the `packages/agents` directory (for local development)
- Environment variables in Docker Compose files
- System environment variables

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `8000` |
| `ENVIRONMENT` | Environment (development/production) | `development` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `OPENAI_API_KEY` | OpenAI API key (optional) | - |
| `ANTHROPIC_API_KEY` | Anthropic API key (optional) | - |
| `GEMINI_API_KEY` | Google Gemini API key (optional) | - |
| `RAG_SERVICE_URL` | External RAG service URL (optional) | - |

### Using .env File

For local development, create a `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
```

Example `.env` file:
```bash
PORT=8000
ENVIRONMENT=development
LOG_LEVEL=DEBUG
OPENAI_API_KEY=sk-your-key-here
```

**Note**: The `.env` file is automatically loaded by `python-dotenv` when the service starts. Never commit `.env` files to version control.

## Testing

Run tests using pytest:

```bash
# From packages/agents directory
pytest tests/
```

## Development

### Project Structure

```
packages/agents/
├── main.py                 # FastAPI application entry point
├── config.py               # Configuration management
├── requirements.txt        # Python dependencies
├── pyproject.toml         # Python project configuration
├── Dockerfile             # Multi-stage Docker build
├── .dockerignore          # Docker ignore file
├── .gitignore             # Git ignore file
├── .env.example           # Environment variables template
├── agents/                # Agent implementations (Feature 1.3)
│   └── __init__.py
├── routes/                # API route handlers
│   ├── __init__.py
│   ├── health.py          # Health check endpoints
│   └── agents.py          # Agent interaction endpoints
└── tests/                 # Test files
    ├── __init__.py
    └── test_health.py     # Health endpoint tests
```

### Adding New Endpoints

1. Create a new router file in `routes/`
2. Import and include the router in `main.py`
3. Add corresponding tests in `tests/`

### Code Style

- Follow PEP 8 guidelines
- Use type hints for function parameters and return values
- Document functions with docstrings

## Integration with Node.js Server

The Node.js server communicates with the Agents Service via the `AgentsService` class in `packages/server/services/agents.ts`. This service provides methods to:

- Check agent service health
- Get agent status
- Send chat messages (Feature 1.3)

Example usage in Node.js:

```typescript
import { agentsService } from './services/agents';

// Check if agents service is available
const isAvailable = await agentsService.isAvailable();

// Get agent status
const status = await agentsService.getAgentStatus();
```

## Future Enhancements (Feature 1.3)

The following features will be implemented in Feature 1.3:

- **LangGraph Supervisor Agent**: Autonomous agent for troubleshooting
- **RAG Integration**: Connection to external RAG service for context-aware responses
- **Tool Execution**: Agent tools for querying logs, checking metrics, and searching documentation
- **Streaming Responses**: Real-time streaming of agent responses

## Troubleshooting

### Service Won't Start

- Ensure Python 3.11+ is installed
- Check that all dependencies are installed: `pip install -r requirements.txt`
- Verify port 8000 is not in use

### Docker Build Fails

- Ensure Docker is running
- Check Docker logs: `docker-compose logs agents`
- Verify Dockerfile syntax

### Connection Refused from Node.js Server

- Ensure agents service is running
- Check Docker network configuration
- Verify `AGENTS_SERVICE_URL` environment variable in Node.js server

## License

MIT
