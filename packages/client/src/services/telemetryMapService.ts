/**
 * API service for telemetry map operations.
 * Handles CRUD operations for saving and loading infrastructure diagrams.
 */
import { 
  TelemetryMap, 
  CreateTelemetryMapRequest, 
  UpdateTelemetryMapRequest,
  ReactFlowNode,
  ReactFlowEdge 
} from '@/types/telemetryMap';

const API_BASE = '/api/telemetry-maps';

/** Service for managing telemetry maps via API */
export class TelemetryMapService {
  /**
   * Get all telemetry maps for a user or public maps
   */
  static async getTelemetryMaps(userId?: string, isPublic = false): Promise<TelemetryMap[]> {
    const params = new URLSearchParams();
    if (userId && !isPublic) params.append('userId', userId);
    if (isPublic) params.append('isPublic', 'true');
    
    const response = await fetch(`${API_BASE}?${params.toString()}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch telemetry maps: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Get a specific telemetry map by ID
   */
  static async getTelemetryMap(id: string, userId?: string): Promise<TelemetryMap> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    
    const response = await fetch(`${API_BASE}/${id}?${params.toString()}`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch telemetry map: ${response.statusText}`);
    }
    
    return response.json();
  }
  
  /**
   * Create a new telemetry map
   */
  static async createTelemetryMap(
    data: CreateTelemetryMapRequest,
    userId: string
  ): Promise<TelemetryMap> {
    const response = await fetch(`${API_BASE}?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to create telemetry map');
    }
    
    return response.json();
  }
  
  /**
   * Update an existing telemetry map
   */
  static async updateTelemetryMap(
    id: string,
    data: UpdateTelemetryMapRequest,
    userId: string
  ): Promise<TelemetryMap> {
    const response = await fetch(`${API_BASE}/${id}?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to update telemetry map');
    }
    
    return response.json();
  }
  
  /**
   * Delete a telemetry map
   */
  static async deleteTelemetryMap(id: string, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}?userId=${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to delete telemetry map');
    }
  }
  
  /**
   * Convert React Flow nodes and edges to TelemetryMap format
   */
  static convertToTelemetryMapFormat(
    nodes: ReactFlowNode[], 
    edges: ReactFlowEdge[]
  ): {
    nodes: CreateTelemetryMapRequest['nodes'];
    connections: CreateTelemetryMapRequest['connections'];
  } {
    const telemetryNodes = nodes.map(node => ({
      nodeId: node.id,
      nodeType: node.type || node.data.type || 'default',
      label: node.data.label || 'Untitled Node',
      status: node.data.status || 'active' as const,
      description: node.data.description,
      positionX: node.position.x,
      positionY: node.position.y,
      config: node.data.config || {},
    }));
    
    const telemetryConnections = edges.map(edge => ({
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      connectionType: edge.type || 'default',
    }));
    
    return {
      nodes: telemetryNodes,
      connections: telemetryConnections,
    };
  }
  
  /**
   * Convert TelemetryMap format to React Flow nodes and edges
   */
  static convertFromTelemetryMapFormat(map: TelemetryMap): {
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
  } {
    const reactFlowNodes: ReactFlowNode[] = map.nodes.map(node => ({
      id: node.nodeId,
      type: node.nodeType,
      position: { x: node.positionX, y: node.positionY },
      data: {
        label: node.label,
        status: node.status,
        description: node.description,
        config: node.config,
        type: node.nodeType,
      },
    }));
    
    const reactFlowEdges: ReactFlowEdge[] = map.connections.map(connection => ({
      id: `${connection.sourceNodeId}-${connection.targetNodeId}`,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      type: connection.connectionType,
    }));
    
    return {
      nodes: reactFlowNodes,
      edges: reactFlowEdges,
    };
  }
  
  /**
   * Save diagram from React Flow state
   */
  static async saveDiagram(
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    metadata: {
      name: string;
      description?: string;
      isPublic?: boolean;
      tags?: string[];
    },
    userId: string
  ): Promise<TelemetryMap> {
    const { nodes: telemetryNodes, connections } = this.convertToTelemetryMapFormat(nodes, edges);
    
    const createRequest: CreateTelemetryMapRequest = {
      name: metadata.name,
      description: metadata.description,
      isPublic: metadata.isPublic || false,
      tags: metadata.tags || [],
      nodes: telemetryNodes,
      connections,
    };
    
    return this.createTelemetryMap(createRequest, userId);
  }
  
  /**
   * Load diagram to React Flow state
   */
  static async loadDiagram(mapId: string, userId?: string): Promise<{
    nodes: ReactFlowNode[];
    edges: ReactFlowEdge[];
    metadata: Pick<TelemetryMap, 'id' | 'name' | 'description' | 'isPublic' | 'tags' | 'createdBy' | 'createdAt' | 'updatedAt'>;
  }> {
    const map = await this.getTelemetryMap(mapId, userId);
    const { nodes, edges } = this.convertFromTelemetryMapFormat(map);
    
    return {
      nodes,
      edges,
      metadata: {
        id: map.id,
        name: map.name,
        description: map.description,
        isPublic: map.isPublic,
        tags: map.tags,
        createdBy: map.createdBy,
        createdAt: map.createdAt,
        updatedAt: map.updatedAt,
      },
    };
  }
}
