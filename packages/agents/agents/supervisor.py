"""
LangGraph Supervisor Agent

This module implements the main supervisor agent that orchestrates troubleshooting
and analysis tasks using LangGraph.
"""

from typing import Annotated, Sequence, TypedDict, Literal
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langgraph.checkpoint.memory import MemorySaver
from tools.rag_tools import get_rag_tools
from tools.system_tools import get_system_tools
from config import get_settings
import operator
import logging

logger = logging.getLogger(__name__)


class AgentState(TypedDict):
    """State for the supervisor agent"""
    messages: Annotated[Sequence[BaseMessage], operator.add]
    next: str


class SupervisorAgent:
    """
    LangGraph-based supervisor agent for autonomous troubleshooting.
    
    This agent can:
    - Search documentation via RAG
    - Query historical incident logs
    - Check system metrics
    - Query logs
    - Plan and execute troubleshooting steps
    """
    
    def __init__(self, model_name: str = "gpt-4o-mini", provider: str = "openai"):
        """
        Initialize the supervisor agent
        
        Args:
            model_name: Name of the LLM model to use
            provider: LLM provider (openai, anthropic)
        """
        self.settings = get_settings()
        self.model_name = model_name
        self.provider = provider
        self.llm = self._create_llm()
        self.tools = self._create_tools()
        self.graph = self._create_graph()
        self.checkpointer = MemorySaver()
        
    def _create_llm(self):
        """Create the LLM instance based on provider"""
        if self.provider == "openai":
            if not self.settings.OPENAI_API_KEY:
                raise ValueError("OPENAI_API_KEY not configured")
            return ChatOpenAI(
                model=self.model_name,
                temperature=0.1,
                api_key=self.settings.OPENAI_API_KEY
            )
        elif self.provider == "anthropic":
            if not self.settings.ANTHROPIC_API_KEY:
                raise ValueError("ANTHROPIC_API_KEY not configured")
            return ChatAnthropic(
                model=self.model_name,
                temperature=0.1,
                api_key=self.settings.ANTHROPIC_API_KEY
            )
        else:
            raise ValueError(f"Unsupported provider: {self.provider}")
    
    def _create_tools(self):
        """Create and combine all available tools"""
        tools = []
        
        # Add RAG tools
        try:
            rag_tools = get_rag_tools()
            tools.extend(rag_tools)
            logger.info(f"Loaded {len(rag_tools)} RAG tools")
        except Exception as e:
            logger.warning(f"Failed to load RAG tools: {e}")
        
        # Add system tools
        try:
            system_tools = get_system_tools()
            tools.extend(system_tools)
            logger.info(f"Loaded {len(system_tools)} system tools")
        except Exception as e:
            logger.warning(f"Failed to load system tools: {e}")
        
        if not tools:
            logger.warning("No tools available for agent")
        
        return tools
    
    def _create_system_prompt(self) -> str:
        """Create the system prompt for the agent"""
        return """You are Synapse AI, an intelligent troubleshooting assistant for on-call engineers.

Your role is to help engineers diagnose and resolve issues in their infrastructure by:
1. Analyzing the problem description
2. Searching relevant documentation and past incidents
3. Checking system metrics and logs
4. Providing step-by-step troubleshooting guidance
5. Suggesting remediation actions

Available tools:
- search_documentation: Find relevant documentation and guides
- retrieve_context: Get context from docs and historical logs
- search_incident_logs: Find similar past incidents
- check_metrics: Query system metrics
- query_logs: Search and analyze logs

Guidelines:
- Always start by understanding the problem fully
- Search for similar past incidents to learn from previous resolutions
- Check relevant metrics and logs to gather evidence
- Provide clear, actionable recommendations
- Explain your reasoning at each step
- If you're unsure, say so and suggest next steps

Be concise but thorough. Focus on solving the problem efficiently."""
    
    def _should_continue(self, state: AgentState) -> Literal["tools", "end"]:
        """Determine if the agent should continue or end"""
        messages = state["messages"]
        last_message = messages[-1]
        
        # If the LLM makes a tool call, route to tools
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        
        # Otherwise, end
        return "end"
    
    def _call_model(self, state: AgentState) -> dict:
        """Call the LLM with the current state"""
        messages = state["messages"]
        
        # Create the prompt with system message
        system_message = SystemMessage(content=self._create_system_prompt())
        all_messages = [system_message] + list(messages)
        
        # Bind tools to the model
        model_with_tools = self.llm.bind_tools(self.tools)
        
        # Call the model
        response = model_with_tools.invoke(all_messages)
        
        return {"messages": [response]}
    
    def _create_graph(self):
        """Create the LangGraph workflow"""
        # Create the graph
        workflow = StateGraph(AgentState)
        
        # Add nodes
        workflow.add_node("agent", self._call_model)
        
        # Only add tool node if we have tools
        if self.tools:
            tool_node = ToolNode(self.tools)
            workflow.add_node("tools", tool_node)
        
        # Set entry point
        workflow.set_entry_point("agent")
        
        # Add conditional edges
        if self.tools:
            workflow.add_conditional_edges(
                "agent",
                self._should_continue,
                {
                    "tools": "tools",
                    "end": END
                }
            )
            # After tools, go back to agent
            workflow.add_edge("tools", "agent")
        else:
            # If no tools, just end after agent
            workflow.add_edge("agent", END)
        
        # Compile the graph
        return workflow.compile(checkpointer=self.checkpointer)
    
    async def chat(
        self,
        message: str,
        session_id: str = "default",
        context: dict = None
    ) -> dict:
        """
        Send a message to the agent and get a response
        
        Args:
            message: User message
            session_id: Session ID for conversation continuity
            context: Optional context information
            
        Returns:
            Response dictionary with message and metadata
        """
        try:
            # Prepare the input
            input_message = HumanMessage(content=message)
            
            # Add context if provided
            if context:
                context_str = "\n".join([f"{k}: {v}" for k, v in context.items()])
                input_message.content = f"Context:\n{context_str}\n\nQuestion: {message}"
            
            # Configure the graph execution
            config = {
                "configurable": {
                    "thread_id": session_id
                }
            }
            
            # Run the graph
            result = await self.graph.ainvoke(
                {"messages": [input_message]},
                config=config
            )
            
            # Extract the final response
            messages = result["messages"]
            final_message = messages[-1]
            
            # Get the response content
            if isinstance(final_message, AIMessage):
                response_text = final_message.content
            else:
                response_text = str(final_message)
            
            # Count tool calls
            tool_calls = []
            for msg in messages:
                if hasattr(msg, "tool_calls") and msg.tool_calls:
                    tool_calls.extend([tc["name"] for tc in msg.tool_calls])
            
            return {
                "response": response_text,
                "session_id": session_id,
                "metadata": {
                    "model": self.model_name,
                    "provider": self.provider,
                    "tools_used": tool_calls,
                    "message_count": len(messages)
                }
            }
            
        except Exception as e:
            logger.error(f"Error in agent chat: {e}", exc_info=True)
            return {
                "response": f"I encountered an error while processing your request: {str(e)}",
                "session_id": session_id,
                "metadata": {
                    "error": str(e)
                }
            }
    
    async def stream_chat(
        self,
        message: str,
        session_id: str = "default",
        context: dict = None
    ):
        """
        Stream agent responses (for future implementation)
        
        Args:
            message: User message
            session_id: Session ID for conversation continuity
            context: Optional context information
            
        Yields:
            Response chunks
        """
        # Prepare the input
        input_message = HumanMessage(content=message)
        
        if context:
            context_str = "\n".join([f"{k}: {v}" for k, v in context.items()])
            input_message.content = f"Context:\n{context_str}\n\nQuestion: {message}"
        
        # Configure the graph execution
        config = {
            "configurable": {
                "thread_id": session_id
            }
        }
        
        # Stream the graph execution
        async for event in self.graph.astream_events(
            {"messages": [input_message]},
            config=config,
            version="v1"
        ):
            kind = event["event"]
            
            if kind == "on_chat_model_stream":
                content = event["data"]["chunk"].content
                if content:
                    yield {
                        "type": "content",
                        "data": content
                    }
            elif kind == "on_tool_start":
                yield {
                    "type": "tool_start",
                    "data": {
                        "tool": event["name"]
                    }
                }
            elif kind == "on_tool_end":
                yield {
                    "type": "tool_end",
                    "data": {
                        "tool": event["name"]
                    }
                }


# Global agent instance
_agent: SupervisorAgent = None


def get_agent(model_name: str = "gpt-4o-mini", provider: str = "openai") -> SupervisorAgent:
    """
    Get or create the global agent instance
    
    Args:
        model_name: Name of the LLM model to use
        provider: LLM provider (openai, anthropic)
        
    Returns:
        SupervisorAgent instance
    """
    global _agent
    if _agent is None:
        _agent = SupervisorAgent(model_name=model_name, provider=provider)
    return _agent
