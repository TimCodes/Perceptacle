"""
RAG Client for Python Agents Service

This module provides a client for communicating with the external RAG service.
"""

import httpx
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from config import get_settings


class RagDocument(BaseModel):
    """RAG document model"""
    id: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    score: float
    source: Optional[str] = None
    timestamp: Optional[str] = None


class RagQueryParams(BaseModel):
    """RAG query parameters"""
    query: str
    top_k: int = Field(default=5, ge=1, le=100)
    threshold: float = Field(default=0.7, ge=0.0, le=1.0)
    filters: Optional[Dict[str, Any]] = None
    namespace: Optional[str] = None


class RagQueryResponse(BaseModel):
    """RAG query response"""
    documents: List[RagDocument]
    query: str
    total_results: int
    processing_time: Optional[float] = None


class RagRetrievalParams(BaseModel):
    """RAG retrieval parameters"""
    document_ids: List[str]
    namespace: Optional[str] = None


class RagRetrievalResponse(BaseModel):
    """RAG retrieval response"""
    documents: List[RagDocument]
    not_found: Optional[List[str]] = None


class RagHealthResponse(BaseModel):
    """RAG health check response"""
    status: str
    service: str
    timestamp: str
    version: Optional[str] = None


class RagIndexStats(BaseModel):
    """RAG index statistics"""
    total_documents: int
    namespaces: Optional[List[str]] = None
    last_updated: Optional[str] = None
    index_size: Optional[int] = None


class RagClient:
    """Client for communicating with the RAG service"""
    
    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        timeout: Optional[int] = None
    ):
        settings = get_settings()
        self.base_url = base_url or settings.RAG_SERVICE_URL or "http://rag-service:8080"
        self.api_key = api_key or settings.RAG_SERVICE_API_KEY
        self.timeout = (timeout or settings.RAG_SERVICE_TIMEOUT) / 1000.0  # Convert ms to seconds
        
    def _get_headers(self) -> Dict[str, str]:
        """Build HTTP headers for requests"""
        headers = {
            "Content-Type": "application/json"
        }
        
        if self.api_key:
            headers["X-API-Key"] = self.api_key
            
        return headers
    
    async def query(self, params: RagQueryParams) -> RagQueryResponse:
        """
        Query the RAG service for relevant documents
        
        Args:
            params: Query parameters
            
        Returns:
            Query response with relevant documents
            
        Raises:
            httpx.HTTPError: If the request fails
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/query",
                json=params.model_dump(),
                headers=self._get_headers()
            )
            response.raise_for_status()
            data = response.json()
            
            # Normalize response format
            return RagQueryResponse(
                documents=[self._normalize_document(doc) for doc in (data.get("documents") or data.get("results") or [])],
                query=params.query,
                total_results=data.get("total_results") or data.get("totalResults") or len(data.get("documents", [])),
                processing_time=data.get("processing_time") or data.get("processingTime")
            )
    
    async def retrieve(self, params: RagRetrievalParams) -> RagRetrievalResponse:
        """
        Retrieve specific documents by ID
        
        Args:
            params: Retrieval parameters
            
        Returns:
            Retrieval response with requested documents
            
        Raises:
            httpx.HTTPError: If the request fails
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                f"{self.base_url}/api/retrieve",
                json=params.model_dump(),
                headers=self._get_headers()
            )
            response.raise_for_status()
            data = response.json()
            
            return RagRetrievalResponse(
                documents=[self._normalize_document(doc) for doc in data.get("documents", [])],
                not_found=data.get("not_found") or data.get("notFound")
            )
    
    async def search(
        self,
        query: str,
        top_k: int = 5,
        threshold: float = 0.7,
        filters: Optional[Dict[str, Any]] = None,
        namespace: Optional[str] = None
    ) -> List[RagDocument]:
        """
        Simple search interface (wrapper around query)
        
        Args:
            query: Search query
            top_k: Number of results to return
            threshold: Minimum relevance score
            filters: Optional filters
            namespace: Optional namespace
            
        Returns:
            List of relevant documents
        """
        params = RagQueryParams(
            query=query,
            top_k=top_k,
            threshold=threshold,
            filters=filters,
            namespace=namespace
        )
        response = await self.query(params)
        return response.documents
    
    async def check_health(self) -> RagHealthResponse:
        """
        Check RAG service health status
        
        Returns:
            Health status response
            
        Raises:
            httpx.HTTPError: If the request fails
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/health",
                headers=self._get_headers()
            )
            response.raise_for_status()
            return RagHealthResponse(**response.json())
    
    async def get_index_stats(self) -> RagIndexStats:
        """
        Get RAG index statistics
        
        Returns:
            Index statistics
            
        Raises:
            httpx.HTTPError: If the request fails
        """
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.get(
                f"{self.base_url}/api/stats",
                headers=self._get_headers()
            )
            response.raise_for_status()
            data = response.json()
            
            return RagIndexStats(
                total_documents=data.get("total_documents") or data.get("totalDocuments") or 0,
                namespaces=data.get("namespaces"),
                last_updated=data.get("last_updated"),
                index_size=data.get("index_size") or data.get("indexSize")
            )
    
    async def is_available(self) -> bool:
        """
        Check if the RAG service is available
        
        Returns:
            True if available, False otherwise
        """
        try:
            await self.check_health()
            return True
        except Exception:
            return False
    
    def _normalize_document(self, doc: Dict[str, Any]) -> RagDocument:
        """
        Normalize document format from various RAG service response formats
        
        Args:
            doc: Raw document data
            
        Returns:
            Normalized RagDocument
        """
        return RagDocument(
            id=doc.get("id") or doc.get("document_id") or doc.get("doc_id"),
            content=doc.get("content") or doc.get("text") or doc.get("document") or "",
            metadata=doc.get("metadata") or doc.get("meta") or {},
            score=doc.get("score") or doc.get("similarity") or doc.get("relevance") or 0.0,
            source=doc.get("source") or (doc.get("metadata") or {}).get("source"),
            timestamp=doc.get("timestamp")
        )


# Global RAG client instance
_rag_client: Optional[RagClient] = None


def get_rag_client() -> RagClient:
    """
    Get or create the global RAG client instance
    
    Returns:
        RAG client instance
    """
    global _rag_client
    if _rag_client is None:
        _rag_client = RagClient()
    return _rag_client
