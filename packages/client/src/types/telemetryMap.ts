import type { NodeTypeDefinition } from './nodeTypes';

// Telemetry Map Types
export interface TelemetryMap {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags: string[];
  metadata: Record<string, any>;
  nodes: TelemetryMapNode[];
  connections: TelemetryMapConnection[];
}

export interface TelemetryMapNode {
  id: string;
  mapId: string;
  nodeId: string; // The node's ID from the diagram
  nodeType: string | NodeTypeDefinition; // Support both legacy string and new structure
  label: string;
  status: 'active' | 'warning' | 'error' | 'inactive';
  description?: string;
  positionX: number;
  positionY: number;
  config: Record<string, any>; // Node-specific configuration
  createdAt: string;
}

export interface TelemetryMapConnection {
  id: string;
  mapId: string;
  sourceNodeId: string;
  targetNodeId: string;
  connectionType: string;
  createdAt: string;
}

// Request/Response Types
export interface CreateTelemetryMapRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  nodes: Omit<TelemetryMapNode, 'id' | 'mapId' | 'createdAt'>[];
  connections: Omit<TelemetryMapConnection, 'id' | 'mapId' | 'createdAt'>[];
}

export interface UpdateTelemetryMapRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  nodes?: Omit<TelemetryMapNode, 'id' | 'mapId' | 'createdAt'>[];
  connections?: Omit<TelemetryMapConnection, 'id' | 'mapId' | 'createdAt'>[];
}

export interface TelemetryMapListResponse {
  maps: TelemetryMap[];
  total: number;
}

// For converting React Flow nodes/edges to/from TelemetryMap format
export interface ReactFlowNodeData {
  label: string;
  status: 'active' | 'warning' | 'error' | 'inactive';
  description?: string;
  config?: Record<string, any>;
  type?: string | NodeTypeDefinition; // Support both legacy string and new structure
}

export interface ReactFlowNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: ReactFlowNodeData;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
}

// Utility types for saving/loading diagrams
export interface DiagramExportData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}

export interface SaveMapDialogData {
  name: string;
  description?: string;
  isPublic: boolean;
  tags: string[];
}
