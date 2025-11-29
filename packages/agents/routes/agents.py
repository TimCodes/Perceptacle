"""
Agent interaction endpoints (placeholder for future implementation).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any

router = APIRouter()


class ChatRequest(BaseModel):
    """Chat request model (placeholder)."""
    message: str
    session_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response model (placeholder)."""
    response: str
    session_id: str


@router.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat endpoint (placeholder for Feature 1.3).
    
    This endpoint will be implemented in Feature 1.3 when the LangGraph
    supervisor agent is created.
    """
    raise HTTPException(
        status_code=501,
        detail="Chat endpoint not yet implemented. This will be available in Feature 1.3."
    )


@router.get("/status")
async def agent_status():
    """
    Get agent service status.
    """
    return {
        "agents_available": False,
        "message": "Agent implementation pending (Feature 1.3)",
        "features": {
            "supervisor_agent": False,
            "rag_integration": False,
            "tool_execution": False
        }
    }
