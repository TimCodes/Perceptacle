"""
Synapse Agents Service - FastAPI application for hosting LangGraph agents.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from datetime import datetime

from config import get_settings
from routes import health, agents

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%I:%M:%S %p'
)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()

# Create FastAPI application
app = FastAPI(
    title="Synapse Agents Service",
    description="Python microservice for hosting LangGraph AI agents",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(agents.router, prefix="/api/agents", tags=["agents"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": settings.SERVICE_NAME,
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info(f"Starting {settings.SERVICE_NAME}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Port: {settings.PORT}")


@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info(f"Shutting down {settings.SERVICE_NAME}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.is_development,
        log_level=settings.LOG_LEVEL.lower()
    )
