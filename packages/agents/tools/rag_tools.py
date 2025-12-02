"""
RAG Tools for LangChain Agents

This module provides tools for agents to interact with the RAG service.
"""

from typing import Optional, Dict, Any
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
from services.rag_client import get_rag_client, RagQueryParams


class SearchDocumentationInput(BaseModel):
    """Input for SearchDocumentationTool"""
    query: str = Field(description="The search query to find relevant documentation")
    top_k: int = Field(default=5, description="Number of results to return (1-10)")
    threshold: float = Field(default=0.7, description="Minimum relevance score (0.0-1.0)")


class SearchDocumentationTool(BaseTool):
    """
    Tool for searching documentation using the RAG service.
    
    This tool allows agents to search through documentation, guides,
    and knowledge base articles to find relevant information.
    """
    
    name: str = "search_documentation"
    description: str = (
        "Search through documentation and knowledge base articles. "
        "Use this when you need to find information about how to troubleshoot issues, "
        "best practices, configuration guides, or technical documentation. "
        "Input should be a clear search query describing what you're looking for."
    )
    args_schema: type[BaseModel] = SearchDocumentationInput
    
    def _run(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.7,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the search synchronously (not recommended for async agents)
        """
        import asyncio
        return asyncio.run(self._arun(query, top_k, threshold, run_manager))
    
    async def _arun(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.7,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the search asynchronously
        
        Args:
            query: Search query
            top_k: Number of results to return
            threshold: Minimum relevance score
            run_manager: Optional callback manager
            
        Returns:
            Formatted search results as a string
        """
        try:
            rag_client = get_rag_client()
            
            # Limit top_k to reasonable range
            top_k = max(1, min(top_k, 10))
            threshold = max(0.0, min(threshold, 1.0))
            
            documents = await rag_client.search(
                query=query,
                top_k=top_k,
                threshold=threshold,
                filters={"category": "documentation"}  # Filter for documentation only
            )
            
            if not documents:
                return f"No relevant documentation found for query: {query}"
            
            # Format results
            results = [f"Found {len(documents)} relevant documentation articles:\n"]
            
            for i, doc in enumerate(documents, 1):
                results.append(f"\n{i}. {doc.source or 'Unknown source'} (relevance: {doc.score:.2f})")
                results.append(f"   {doc.content[:500]}...")  # Truncate long content
                if doc.metadata:
                    tags = doc.metadata.get("tags", [])
                    if tags:
                        results.append(f"   Tags: {', '.join(tags)}")
            
            return "\n".join(results)
            
        except Exception as e:
            return f"Error searching documentation: {str(e)}"


class RetrieveContextInput(BaseModel):
    """Input for RetrieveContextTool"""
    query: str = Field(description="The query to find relevant context for")
    top_k: int = Field(default=3, description="Number of context items to retrieve (1-5)")
    include_logs: bool = Field(default=True, description="Whether to include historical logs")


class RetrieveContextTool(BaseTool):
    """
    Tool for retrieving relevant context from the RAG service.
    
    This tool retrieves context from both documentation and historical logs
    to help answer questions or troubleshoot issues.
    """
    
    name: str = "retrieve_context"
    description: str = (
        "Retrieve relevant context including documentation and historical incident logs. "
        "Use this when you need background information, similar past issues, "
        "or context to understand a problem better. "
        "Input should be a description of the issue or question you need context for."
    )
    args_schema: type[BaseModel] = RetrieveContextInput
    
    def _run(
        self,
        query: str,
        top_k: int = 3,
        include_logs: bool = True,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the retrieval synchronously (not recommended for async agents)
        """
        import asyncio
        return asyncio.run(self._arun(query, top_k, include_logs, run_manager))
    
    async def _arun(
        self,
        query: str,
        top_k: int = 3,
        include_logs: bool = True,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the retrieval asynchronously
        
        Args:
            query: Context query
            top_k: Number of results to return
            include_logs: Whether to include historical logs
            run_manager: Optional callback manager
            
        Returns:
            Formatted context as a string
        """
        try:
            rag_client = get_rag_client()
            
            # Limit top_k to reasonable range
            top_k = max(1, min(top_k, 5))
            
            # Build filters based on what to include
            filters: Dict[str, Any] = {}
            if not include_logs:
                filters["category"] = "documentation"
            
            documents = await rag_client.search(
                query=query,
                top_k=top_k,
                threshold=0.6,  # Slightly lower threshold for context retrieval
                filters=filters if filters else None
            )
            
            if not documents:
                return f"No relevant context found for: {query}"
            
            # Format results by category
            results = [f"Retrieved {len(documents)} relevant context items:\n"]
            
            for i, doc in enumerate(documents, 1):
                category = doc.metadata.get("category", "unknown")
                source = doc.source or "Unknown source"
                
                results.append(f"\n{i}. [{category.upper()}] {source}")
                results.append(f"   Relevance: {doc.score:.2f}")
                results.append(f"   {doc.content[:400]}...")  # Truncate content
                
                # Add metadata if available
                if doc.metadata:
                    if "severity" in doc.metadata:
                        results.append(f"   Severity: {doc.metadata['severity']}")
                    if "resolved" in doc.metadata:
                        results.append(f"   Resolved: {doc.metadata['resolved']}")
                    if "tags" in doc.metadata:
                        results.append(f"   Tags: {', '.join(doc.metadata['tags'][:3])}")
            
            return "\n".join(results)
            
        except Exception as e:
            return f"Error retrieving context: {str(e)}"


class SearchIncidentLogsInput(BaseModel):
    """Input for SearchIncidentLogsTool"""
    query: str = Field(description="The search query to find similar past incidents")
    top_k: int = Field(default=3, description="Number of incidents to return (1-5)")


class SearchIncidentLogsTool(BaseTool):
    """
    Tool for searching historical incident logs.
    
    This tool searches through past incidents to find similar issues
    and their resolutions.
    """
    
    name: str = "search_incident_logs"
    description: str = (
        "Search through historical incident logs to find similar past issues and their resolutions. "
        "Use this when troubleshooting a problem to see if similar issues have occurred before "
        "and how they were resolved. "
        "Input should be a description of the current issue or error."
    )
    args_schema: type[BaseModel] = SearchIncidentLogsInput
    
    def _run(
        self,
        query: str,
        top_k: int = 3,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the search synchronously (not recommended for async agents)
        """
        import asyncio
        return asyncio.run(self._arun(query, top_k, run_manager))
    
    async def _arun(
        self,
        query: str,
        top_k: int = 3,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the search asynchronously
        
        Args:
            query: Incident search query
            top_k: Number of results to return
            run_manager: Optional callback manager
            
        Returns:
            Formatted incident logs as a string
        """
        try:
            rag_client = get_rag_client()
            
            # Limit top_k to reasonable range
            top_k = max(1, min(top_k, 5))
            
            documents = await rag_client.search(
                query=query,
                top_k=top_k,
                threshold=0.65,
                filters={"category": "incident"}  # Filter for incidents only
            )
            
            if not documents:
                return f"No similar past incidents found for: {query}"
            
            # Format results
            results = [f"Found {len(documents)} similar past incidents:\n"]
            
            for i, doc in enumerate(documents, 1):
                source = doc.source or "Unknown incident"
                severity = doc.metadata.get("severity", "unknown")
                resolved = doc.metadata.get("resolved", False)
                
                results.append(f"\n{i}. {source}")
                results.append(f"   Severity: {severity} | Resolved: {'Yes' if resolved else 'No'}")
                results.append(f"   Similarity: {doc.score:.2f}")
                results.append(f"   {doc.content}")
                
                if doc.metadata.get("tags"):
                    results.append(f"   Related: {', '.join(doc.metadata['tags'][:5])}")
            
            return "\n".join(results)
            
        except Exception as e:
            return f"Error searching incident logs: {str(e)}"


# Export all tools
def get_rag_tools() -> list[BaseTool]:
    """
    Get all RAG tools for use with LangChain agents
    
    Returns:
        List of RAG tools
    """
    return [
        SearchDocumentationTool(),
        RetrieveContextTool(),
        SearchIncidentLogsTool()
    ]
