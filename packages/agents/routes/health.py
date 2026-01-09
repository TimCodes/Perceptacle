"""
Health check endpoints for the Synapse Agents Service.
"""
from fastapi import APIRouter
from datetime import datetime
from config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("")
@router.get("/")
async def health_check():
    """
    Health check endpoint.
    Returns service status and basic information.
    """
    return {
        "status": "healthy",
        "service": settings.SERVICE_NAME,
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT
    }


@router.get("/ready")
async def readiness_check():
    """
    Readiness check endpoint.
    Indicates if the service is ready to accept requests.
    """
    # In the future, this could check dependencies like RAG service
    return {
        "ready": True,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/live")
async def liveness_check():
    """
    Liveness check endpoint.
    Indicates if the service is alive and running.
    """
    return {
        "alive": True,
        "timestamp": datetime.utcnow().isoformat()
    }
