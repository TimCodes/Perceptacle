"""
System Tools for LangChain Agents

This module provides tools for agents to interact with system metrics and logs.
"""

from typing import Optional, Dict, Any, List
from langchain.tools import BaseTool
from pydantic import BaseModel, Field
import httpx
from config import get_settings
import logging

logger = logging.getLogger(__name__)


class CheckMetricsInput(BaseModel):
    """Input for CheckMetricsTool"""
    resource_type: str = Field(description="Type of resource (kubernetes, azure, oracle)")
    resource_id: str = Field(description="ID or name of the resource to check")
    metric_type: str = Field(default="cpu,memory", description="Comma-separated metric types (cpu, memory, disk, network)")
    time_range: str = Field(default="1h", description="Time range (e.g., 1h, 6h, 24h)")


class CheckMetricsTool(BaseTool):
    """
    Tool for checking system metrics.
    
    This tool queries metrics from various infrastructure sources
    like Kubernetes, Azure, Oracle Cloud, etc.
    """
    
    name: str = "check_metrics"
    description: str = (
        "Check system metrics for infrastructure resources. "
        "Use this to get CPU, memory, disk, or network metrics for pods, VMs, or other resources. "
        "Specify the resource type (kubernetes, azure, oracle), resource ID, and metric types."
    )
    args_schema: type[BaseModel] = CheckMetricsInput
    
    def _run(
        self,
        resource_type: str,
        resource_id: str,
        metric_type: str = "cpu,memory",
        time_range: str = "1h",
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the metrics check synchronously (not recommended for async agents)
        """
        import asyncio
        return asyncio.run(self._arun(resource_type, resource_id, metric_type, time_range, run_manager))
    
    async def _arun(
        self,
        resource_type: str,
        resource_id: str,
        metric_type: str = "cpu,memory",
        time_range: str = "1h",
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the metrics check asynchronously
        
        Args:
            resource_type: Type of resource
            resource_id: Resource identifier
            metric_type: Comma-separated metric types
            time_range: Time range for metrics
            run_manager: Optional callback manager
            
        Returns:
            Formatted metrics as a string
        """
        try:
            # This would call the Node.js backend to get metrics
            # For now, return mock data
            settings = get_settings()
            
            # In production, this would call the backend API
            # backend_url = os.getenv("BACKEND_URL", "http://localhost:3000")
            # async with httpx.AsyncClient() as client:
            #     response = await client.get(
            #         f"{backend_url}/api/metrics",
            #         params={
            #             "resource_type": resource_type,
            #             "resource_id": resource_id,
            #             "metric_type": metric_type,
            #             "time_range": time_range
            #         }
            #     )
            #     response.raise_for_status()
            #     data = response.json()
            
            # Mock response for now
            metrics = metric_type.split(",")
            result = [f"Metrics for {resource_type}/{resource_id} (last {time_range}):\n"]
            
            for metric in metrics:
                metric = metric.strip()
                if metric == "cpu":
                    result.append(f"  CPU Usage: 45% (avg), 78% (max)")
                elif metric == "memory":
                    result.append(f"  Memory Usage: 62% (avg), 85% (max)")
                elif metric == "disk":
                    result.append(f"  Disk Usage: 71% (avg), 73% (max)")
                elif metric == "network":
                    result.append(f"  Network I/O: 125 MB/s in, 89 MB/s out")
            
            result.append(f"\nNote: Metrics are averaged over {time_range}")
            
            return "\n".join(result)
            
        except Exception as e:
            logger.error(f"Error checking metrics: {e}")
            return f"Error checking metrics: {str(e)}"


class QueryLogsInput(BaseModel):
    """Input for QueryLogsTool"""
    resource_type: str = Field(description="Type of resource (kubernetes, azure, application)")
    resource_id: str = Field(description="ID or name of the resource")
    query: str = Field(description="Search query or filter (e.g., 'error', 'exception', 'timeout')")
    time_range: str = Field(default="1h", description="Time range (e.g., 1h, 6h, 24h)")
    max_lines: int = Field(default=50, description="Maximum number of log lines to return")


class QueryLogsTool(BaseTool):
    """
    Tool for querying logs from various sources.
    
    This tool searches and retrieves logs from Kubernetes pods,
    Azure services, application logs, etc.
    """
    
    name: str = "query_logs"
    description: str = (
        "Query and search logs from infrastructure and applications. "
        "Use this to find errors, exceptions, or specific events in logs. "
        "Specify the resource type, resource ID, search query, and time range."
    )
    args_schema: type[BaseModel] = QueryLogsInput
    
    def _run(
        self,
        resource_type: str,
        resource_id: str,
        query: str,
        time_range: str = "1h",
        max_lines: int = 50,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the log query synchronously (not recommended for async agents)
        """
        import asyncio
        return asyncio.run(self._arun(resource_type, resource_id, query, time_range, max_lines, run_manager))
    
    async def _arun(
        self,
        resource_type: str,
        resource_id: str,
        query: str,
        time_range: str = "1h",
        max_lines: int = 50,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the log query asynchronously
        
        Args:
            resource_type: Type of resource
            resource_id: Resource identifier
            query: Search query
            time_range: Time range for logs
            max_lines: Maximum lines to return
            run_manager: Optional callback manager
            
        Returns:
            Formatted log entries as a string
        """
        try:
            # This would call the Node.js backend to get logs
            # For now, return mock data
            settings = get_settings()
            
            # In production, this would call the backend API
            # backend_url = os.getenv("BACKEND_URL", "http://localhost:3000")
            # async with httpx.AsyncClient() as client:
            #     response = await client.get(
            #         f"{backend_url}/api/logs",
            #         params={
            #             "resource_type": resource_type,
            #             "resource_id": resource_id,
            #             "query": query,
            #             "time_range": time_range,
            #             "max_lines": max_lines
            #         }
            #     )
            #     response.raise_for_status()
            #     data = response.json()
            
            # Mock response for now
            result = [f"Logs for {resource_type}/{resource_id} matching '{query}' (last {time_range}):\n"]
            
            # Simulate some log entries
            mock_logs = [
                "2024-12-02 07:10:15 [ERROR] Connection timeout to database server",
                "2024-12-02 07:08:42 [WARN] High memory usage detected: 85%",
                "2024-12-02 07:05:33 [ERROR] Failed to process message: NullPointerException",
                "2024-12-02 07:02:11 [INFO] Retrying failed operation (attempt 3/5)",
                "2024-12-02 07:00:05 [ERROR] API request failed with status 503"
            ]
            
            # Filter logs based on query
            filtered_logs = [log for log in mock_logs if query.lower() in log.lower()]
            
            if not filtered_logs:
                result.append(f"No logs found matching '{query}'")
            else:
                result.append(f"Found {len(filtered_logs)} matching entries:\n")
                for i, log in enumerate(filtered_logs[:max_lines], 1):
                    result.append(f"{i}. {log}")
            
            return "\n".join(result)
            
        except Exception as e:
            logger.error(f"Error querying logs: {e}")
            return f"Error querying logs: {str(e)}"


class AnalyzeHealthInput(BaseModel):
    """Input for AnalyzeHealthTool"""
    resource_type: str = Field(description="Type of resource to analyze (kubernetes, azure, oracle, application)")
    resource_id: str = Field(description="ID or name of the resource")


class AnalyzeHealthTool(BaseTool):
    """
    Tool for analyzing overall health of a resource.
    
    This tool provides a comprehensive health check including
    metrics, recent errors, and status information.
    """
    
    name: str = "analyze_health"
    description: str = (
        "Analyze the overall health of a resource including metrics, errors, and status. "
        "Use this to get a quick overview of a resource's current state. "
        "Specify the resource type and resource ID."
    )
    args_schema: type[BaseModel] = AnalyzeHealthInput
    
    def _run(
        self,
        resource_type: str,
        resource_id: str,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the health analysis synchronously (not recommended for async agents)
        """
        import asyncio
        return asyncio.run(self._arun(resource_type, resource_id, run_manager))
    
    async def _arun(
        self,
        resource_type: str,
        resource_id: str,
        run_manager: Optional[Any] = None
    ) -> str:
        """
        Execute the health analysis asynchronously
        
        Args:
            resource_type: Type of resource
            resource_id: Resource identifier
            run_manager: Optional callback manager
            
        Returns:
            Formatted health analysis as a string
        """
        try:
            # This would call the Node.js backend to get health info
            # For now, return mock data
            
            result = [f"Health Analysis for {resource_type}/{resource_id}:\n"]
            
            # Mock health data
            result.append("Status: DEGRADED")
            result.append("\nMetrics (last 1h):")
            result.append("  CPU: 45% avg, 78% max")
            result.append("  Memory: 62% avg, 85% max (WARNING: High usage)")
            result.append("  Disk: 71% avg")
            result.append("\nRecent Issues:")
            result.append("  - 3 connection timeouts in last hour")
            result.append("  - 2 failed API requests (503 errors)")
            result.append("  - Memory usage exceeded 80% threshold")
            result.append("\nRecommendations:")
            result.append("  1. Investigate memory leak or increase memory allocation")
            result.append("  2. Check database connection pool settings")
            result.append("  3. Review API endpoint health")
            
            return "\n".join(result)
            
        except Exception as e:
            logger.error(f"Error analyzing health: {e}")
            return f"Error analyzing health: {str(e)}"


# Export all tools
def get_system_tools() -> List[BaseTool]:
    """
    Get all system tools for use with LangChain agents
    
    Returns:
        List of system tools
    """
    return [
        CheckMetricsTool(),
        QueryLogsTool(),
        AnalyzeHealthTool()
    ]
