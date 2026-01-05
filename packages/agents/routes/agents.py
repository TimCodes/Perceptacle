"""
Agent interaction endpoints.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from agents import get_agent

router = APIRouter()


class ChatRequest(BaseModel):
    """Chat request model."""
    message: str
    session_id: Optional[str] = "default"
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Chat response model."""
    response: str
    session_id: str
    metadata: Optional[Dict[str, Any]] = None


@router.post("/chat")
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Chat with the autonomous supervisor agent.
    
    The agent uses LangGraph to plan and execute troubleshooting steps
    using available tools (RAG, metrics, logs).
    """
    try:
        agent = get_agent()
        
        result = await agent.chat(
            message=request.message,
            session_id=request.session_id,
            context=request.context
        )
        
        return ChatResponse(
            response=result["response"],
            session_id=result["session_id"],
            metadata=result.get("metadata")
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )


from fastapi.responses import StreamingResponse
import json

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream chat response from the agent.
    """
    try:
        agent = get_agent()
        
        async def event_generator():
            async for event in agent.stream_chat(
                message=request.message,
                session_id=request.session_id,
                context=request.context
            ):
                yield f"data: {json.dumps(event)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}"
        )


@router.get("/status")
async def agent_status():
    """
    Get agent service status.
    """
    try:
        # Check if agent can be initialized
        agent = get_agent()
        tools_available = [tool.name for tool in agent.tools]
        
        return {
            "agents_available": True,
            "message": "LangGraph Supervisor Agent is active",
            "features": {
                "supervisor_agent": True,
                "rag_integration": any(t in tools_available for t in ["search_documentation", "retrieve_context"]),
                "tool_execution": True,
                "available_tools": tools_available
            },
            "model": agent.model_name,
            "provider": agent.provider
        }
    except Exception as e:
        return {
            "agents_available": False,
            "message": f"Agent initialization failed: {str(e)}",
            "features": {
                "supervisor_agent": False,
                "rag_integration": False,
                "tool_execution": False
            }
        }
