import type { NodeTypeDefinition } from './nodeTypes';

// Telemetry Map Types for Server
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
  _legacyType?: string; // Store legacy type for rollback capability
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
