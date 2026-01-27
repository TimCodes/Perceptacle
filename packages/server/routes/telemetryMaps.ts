import { Router, type Request, Response } from "express";
import { TelemetryMap } from "../types/telemetryMap.js";
import { NodeTypeHelper } from "../utils/nodeTypeHelpers.js";
import { validateNodeType, type NodeTypeDefinition } from "../types/nodeTypes.js";

const router = Router();

// Mock data for development/testing
const mockMaps: TelemetryMap[] = [
  {
    id: "map-1",
    name: "Sample Azure Infrastructure",
    description: "A sample Azure-based telemetry map with Function Apps and Service Bus",
    createdBy: "user123",
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    isPublic: true,
    tags: ["azure", "serverless", "messaging"],
    metadata: {},
    nodes: [
      {
        id: "node-1",
        mapId: "map-1",
        nodeId: "azure-function-app-1",
        nodeType: { type: "azure", subtype: "function-app" },
        label: "Order Processing Function",
        status: "active",
        description: "Processes customer orders",
        positionX: 100,
        positionY: 100,
        config: {
          subscriptionId: "sub-123",
          resourceGroup: "rg-production",
          resourceName: "order-processing-func",
          location: "eastus",
        },
        createdAt: new Date().toISOString(),
      },
      {
        id: "node-2",
        mapId: "map-1",
        nodeId: "azure-service-bus-1",
        nodeType: { type: "azure", subtype: "service-bus", variant: "queue" },
        label: "Order Queue",
        status: "active",
        description: "Queues order messages",
        positionX: 300,
        positionY: 100,
        config: {
          subscriptionId: "sub-123",
          resourceGroup: "rg-production",
          resourceName: "order-queue",
          location: "eastus",
        },
        createdAt: new Date().toISOString(),
      },
    ],
    connections: [
      {
        id: "conn-1",
        mapId: "map-1",
        sourceNodeId: "azure-function-app-1",
        targetNodeId: "azure-service-bus-1",
        connectionType: "default",
        createdAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "map-2",
    name: "Kubernetes Microservices",
    description: "A Kubernetes-based microservices architecture",
    createdBy: "user456",
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    isPublic: true,
    tags: ["kubernetes", "microservices", "containers"],
    metadata: {},
    nodes: [
      {
        id: "node-3",
        mapId: "map-2",
        nodeId: "k8s-pod-1",
        nodeType: { type: "kubernetes", subtype: "pod" },
        label: "API Gateway",
        status: "warning",
        description: "Main API gateway pod",
        positionX: 150,
        positionY: 200,
        config: {
          namespace: "production",
          endpoint: "",
        },
        createdAt: new Date().toISOString(),
      },
    ],
    connections: [],
  },
];

// In-memory storage for development
let mockStorage = [...mockMaps];

// Get all telemetry maps for a user or public maps
router.get("/", async (req: Request, res: Response) => {
  try {
    const { userId, isPublic } = req.query;

    let filteredMaps;
    if (isPublic === 'true') {
      filteredMaps = mockStorage.filter(map => map.isPublic);
    } else if (userId) {
      filteredMaps = mockStorage.filter(map => map.createdBy === userId);
    } else {
      return res.status(400).json({ error: 'userId required for private maps' });
    }

    // Sort by updated date
    filteredMaps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json(filteredMaps);
  } catch (error) {
    console.error('Error fetching telemetry maps:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific telemetry map by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const map = mockStorage.find(m =>
      m.id === id && (m.isPublic || m.createdBy === userId)
    );

    if (!map) {
      return res.status(404).json({ error: 'Telemetry map not found' });
    }

    res.json(map);
  } catch (error) {
    console.error('Error fetching telemetry map:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new telemetry map
router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;
    const { name, description, isPublic, tags, nodes, connections } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    if (!name) {
      return res.status(400).json({ error: 'Map name is required' });
    }

    const newMap: TelemetryMap = {
      id: `map-${Date.now()}`,
      name,
      description: description || undefined,
      createdBy: userId as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: isPublic || false,
      tags: tags || [],
      metadata: {},
      nodes: (nodes || []).map((node: any, index: number) => {
        // Normalize and validate nodeType
        const normalizedType = NodeTypeHelper.normalize(node.nodeType);
        const validation = validateNodeType(normalizedType);
        
        if (!validation.valid) {
          throw new Error(`Invalid node type for node ${node.nodeId}: ${validation.error}`);
        }
        
        return {
          id: `node-${Date.now()}-${index}`,
          mapId: `map-${Date.now()}`,
          nodeId: node.nodeId,
          nodeType: normalizedType,
          label: node.label,
          status: node.status || 'active',
          description: node.description,
          positionX: node.positionX,
          positionY: node.positionY,
          config: node.config || {},
          createdAt: new Date().toISOString(),
        };
      }),
      connections: (connections || []).map((conn: any, index: number) => ({
        id: `conn-${Date.now()}-${index}`,
        mapId: `map-${Date.now()}`,
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        connectionType: conn.connectionType || 'default',
        createdAt: new Date().toISOString(),
      })),
    };

    mockStorage.push(newMap);

    res.status(201).json(newMap);
  } catch (error) {
    console.error('Error creating telemetry map:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a telemetry map
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;
    const { name, description, isPublic, tags, nodes, connections } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const mapIndex = mockStorage.findIndex(m => m.id === id);

    if (mapIndex === -1) {
      return res.status(404).json({ error: 'Telemetry map not found' });
    }

    const existingMap = mockStorage[mapIndex];

    if (existingMap.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this map' });
    }

    // Update the map
    const updatedMap: TelemetryMap = {
      ...existingMap,
      name: name !== undefined ? name : existingMap.name,
      description: description !== undefined ? description : existingMap.description,
      isPublic: isPublic !== undefined ? isPublic : existingMap.isPublic,
      tags: tags !== undefined ? tags : existingMap.tags,
      updatedAt: new Date().toISOString(),
      nodes: nodes !== undefined ? nodes.map((node: any, index: number) => {
        // Normalize and validate nodeType
        const normalizedType = NodeTypeHelper.normalize(node.nodeType);
        const validation = validateNodeType(normalizedType);
        
        if (!validation.valid) {
          throw new Error(`Invalid node type for node ${node.nodeId}: ${validation.error}`);
        }
        
        return {
          id: `node-${Date.now()}-${index}`,
          mapId: id,
          nodeId: node.nodeId,
          nodeType: normalizedType,
          label: node.label,
          status: node.status || 'active',
          description: node.description,
          positionX: node.positionX,
          positionY: node.positionY,
          config: node.config || {},
          createdAt: new Date().toISOString(),
        };
      }) : existingMap.nodes,
      connections: connections !== undefined ? connections.map((conn: any, index: number) => ({
        id: `conn-${Date.now()}-${index}`,
        mapId: id,
        sourceNodeId: conn.sourceNodeId,
        targetNodeId: conn.targetNodeId,
        connectionType: conn.connectionType || 'default',
        createdAt: new Date().toISOString(),
      })) : existingMap.connections,
    };

    mockStorage[mapIndex] = updatedMap;

    res.json(updatedMap);
  } catch (error) {
    console.error('Error updating telemetry map:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a telemetry map
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User ID required' });
    }

    const mapIndex = mockStorage.findIndex(m => m.id === id);

    if (mapIndex === -1) {
      return res.status(404).json({ error: 'Telemetry map not found' });
    }

    const existingMap = mockStorage[mapIndex];

    if (existingMap.createdBy !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this map' });
    }

    mockStorage.splice(mapIndex, 1);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting telemetry map:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
