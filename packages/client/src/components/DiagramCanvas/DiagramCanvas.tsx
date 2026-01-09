import { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowInstance,
  Node,
  ConnectionLineType,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { useDiagramStore } from "@/utils/diagram-store";
import { getCloudComponents } from "@/utils/cloudComponents";
import { SaveMapDialog } from "@/components/SaveMapDialog";
import { TelemetryMapsLibrary } from "@/components/TelemetryMapsLibrary";
import { TelemetryMapService } from "@/services/telemetryMapService";
import { TelemetryMap, ReactFlowNode, ReactFlowEdge } from "@/types/telemetryMap";
import { useToast } from "@/hooks/use-toast";
import CustomNode from "./CustomNode";
import { NodeConfigDialog } from "../NodeConfigDialog";
import { NewMapDialog, NewMapData } from "../NewMapDialog";

// Extended metadata to include isPublic for map updates
interface MapMetadata extends NewMapData {
  isPublic?: boolean;
}

interface DiagramCanvasProps {
  onNodeSelected?: () => void;
  saveTriggered?: boolean;
  onSaveComplete?: () => void;
  loadTriggered?: boolean;
  onLoadComplete?: () => void;
  newMapTriggered?: boolean;
  onNewMapComplete?: () => void;
}



const nodeTypes = {
  default: CustomNode,
};

// Custom edge style
const defaultEdgeOptions = {
  type: "smoothstep",
  animated: true,
  style: { stroke: "hsl(var(--primary))" },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "hsl(var(--primary))",
  },
};

export default function DiagramCanvas({ onNodeSelected, saveTriggered, onSaveComplete, loadTriggered, onLoadComplete, newMapTriggered, onNewMapComplete }: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { setSelectedNode, setNodes: setStoreNodes, setEdges: setStoreEdges } = useDiagramStore();

  // Save/Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showNewMapDialog, setShowNewMapDialog] = useState(false);
  const [pendingNode, setPendingNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId] = useState('user123'); // Replace with actual user authentication
  const [currentMapMetadata, setCurrentMapMetadata] = useState<MapMetadata | null>(null);
  const [currentMapId, setCurrentMapId] = useState<string | null>(null);

  // Use ref to prevent infinite loops during rapid updates
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();



  // Handle external save trigger
  useEffect(() => {
    if (saveTriggered) {
      setShowSaveDialog(true);
      onSaveComplete?.();
    }
  }, [saveTriggered, onSaveComplete]);

  // Handle external load trigger
  useEffect(() => {
    if (loadTriggered) {
      setShowLibraryDialog(true);
      onLoadComplete?.();
    }
  }, [loadTriggered, onLoadComplete]);

  // Handle external new map trigger
  useEffect(() => {
    if (newMapTriggered) {
      setShowNewMapDialog(true);
      onNewMapComplete?.();
    }
  }, [newMapTriggered, onNewMapComplete]);

  // Sync local state with store - debounced to prevent infinite loops during drag
  useEffect(() => {
    // Clear any pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync operation to avoid rapid updates during drag
    syncTimeoutRef.current = setTimeout(() => {
      if (nodes.length >= 0) { // Allow empty arrays too
        setStoreNodes(nodes);
      }
    }, 50); // 50ms debounce

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [nodes]); // Remove setStoreNodes from deps to prevent infinite loop

  // Update edges appearance based on node status
  useEffect(() => {
    if (nodes.length === 0 || edges.length === 0) return;

    const nodeStatusMap = new Map(nodes.map(n => [n.id, n.data.status]));

    setEdges(eds => eds.map(edge => {
      const sourceStatus = nodeStatusMap.get(edge.source);

      // Default to active style
      let animated = true;
      let stroke = "hsl(var(--primary))";

      if (sourceStatus === 'offline' || sourceStatus === 'inactive') {
        animated = false;
        stroke = "hsl(var(--muted))";
      } else if (sourceStatus === 'error') {
        stroke = "hsl(var(--destructive))";
      }

      // Only update if changed to avoid unnecessary re-renders
      if (edge.animated !== animated || edge.style?.stroke !== stroke) {
        return {
          ...edge,
          animated,
          style: { ...edge.style, stroke },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: stroke,
          }
        };
      }
      return edge;
    }));
  }, [nodes.map(n => n.data.status).join(',')]); // Only depend on status changes

  useEffect(() => {
    if (edges.length >= 0) { // Allow empty arrays too
      setStoreEdges(edges);
    }
  }, [edges]); // Remove setStoreEdges from deps to prevent infinite loop

  // Save map handler
  const handleSaveMap = async (data: {
    name: string;
    description?: string;
    isPublic: boolean;
    tags: string[];
  }) => {
    setIsSaving(true);
    try {
      const mapData = {
        ...data,
        nodes: nodes.map(node => ({
          nodeId: node.id,
          nodeType: node.type || node.data.type || 'default',
          label: node.data.label || 'Untitled Node',
          status: node.data.status || 'active',
          description: node.data.description,
          positionX: node.position.x,
          positionY: node.position.y,
          config: {
            ...node.data,
            // Remove non-config properties
            label: undefined,
            status: undefined,
            description: undefined,
          },
        })),
        connections: edges.map(edge => ({
          sourceNodeId: edge.source,
          targetNodeId: edge.target,
          connectionType: edge.type || 'default',
        })),
      };

      let savedMap;
      if (currentMapId) {
        // Update existing map
        savedMap = await TelemetryMapService.updateTelemetryMap(currentMapId, mapData, currentUserId);
      } else {
        // Create new map
        savedMap = await TelemetryMapService.createTelemetryMap(mapData, currentUserId);
      }
      
      // Update current map metadata and ID after successful save
      setCurrentMapMetadata({
        name: data.name,
        description: data.description,
        tags: data.tags,
        isPublic: data.isPublic,
      });
      setCurrentMapId(savedMap.id);
      
      setShowSaveDialog(false);
      toast({
        title: 'Success',
        description: currentMapId ? 'Telemetry map updated successfully!' : 'Telemetry map saved successfully!',
      });
    } catch (error) {
      console.error('Failed to save map:', error);
      toast({
        title: 'Error',
        description: currentMapId ? 'Failed to update telemetry map. Please try again.' : 'Failed to save telemetry map. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Load map handler
  const handleLoadMap = (map: TelemetryMap) => {
    // Convert TelemetryMap to React Flow nodes and edges
    const loadedNodes: Node[] = map.nodes.map(node => ({
      id: node.nodeId,
      type: 'default',
      position: { x: node.positionX, y: node.positionY },
      data: {
        label: node.label,
        type: node.nodeType,
        status: node.status,
        description: node.description,
        ...node.config,
      },
      className: "dark:bg-background dark:text-foreground",
      style: {
        borderRadius: "8px",
        minWidth: 180,
      },
    }));

    const loadedEdges: Edge[] = map.connections.map(connection => ({
      id: `${connection.sourceNodeId}-${connection.targetNodeId}`,
      source: connection.sourceNodeId,
      target: connection.targetNodeId,
      type: connection.connectionType,
      animated: true,
      style: { stroke: "hsl(var(--primary))" },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "hsl(var(--primary))",
      },
    }));

    setNodes(loadedNodes);
    setEdges(loadedEdges);

    // Set current map metadata and ID for future updates
    setCurrentMapMetadata({
      name: map.name,
      description: map.description,
      tags: map.tags,
      isPublic: map.isPublic,
    });
    setCurrentMapId(map.id);
    setShowLibraryDialog(false);

    toast({
      title: 'Success',
      description: `Loaded telemetry map: ${map.name}`,
    });
  };

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) {
        return;
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "smoothstep",
            animated: true,
            style: { stroke: "hsl(var(--primary))" },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "hsl(var(--primary))",
            },
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !rfInstance) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const initialStatus = "active";
      const componentType = type.replace(/-/g, "_");
      const components = getCloudComponents();
      const componentDefinition = components.find(
        (comp) => comp.type === componentType,
      );

      const customFields =
        componentDefinition?.fields?.map((field: any) => ({
          ...field,
          value: field.defaultValue || "",
        })) || [];

      // Initialize Azure-specific fields for Azure nodes
      const isAzureNode = type.startsWith('azure-');
      const azureFields = isAzureNode ? {
        subscriptionId: '',
        resourceGroup: '',
        resourceName: '',
        location: '',
        workspaceId: '',
        instrumentationKey: ''
      } : {};

      // Initialize Kubernetes-specific fields for Kubernetes nodes
      const isKubernetesNode = type.startsWith('k8s-');
      const kubernetesFields = isKubernetesNode ? {
        namespace: 'default',
        resourceName: '',
        clusterName: '',
        clusterEndpoint: '',
        serviceAccount: '',
        containerName: ''
      } : {};

      // Initialize Kafka-specific fields for Kafka nodes
      const isKafkaNode = type.startsWith('kafka-');
      const kafkaFields = isKafkaNode ? {
        brokerList: '',
        topicName: '',
        consumerGroup: '',
        securityProtocol: 'PLAINTEXT'
      } : {};

      // Initialize GCP-specific fields for GCP nodes
      const gcpComponentTypes = [
        'compute-engine', 'cloud-storage', 'cloud-sql', 'kubernetes-engine',
        'cloud-functions', 'cloud-run', 'load-balancer', 'cloud-armor',
        'app-engine', 'vpc-network'
      ];
      const isGCPNode = gcpComponentTypes.includes(type);
      const gcpFields = isGCPNode ? {
        projectId: '',
        resourceName: '',
        zone: '',
        region: '',
        serviceAccount: '',
        monitoringLabels: '',
        logType: 'system-event'
      } : {};

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: "default",
        position,
        data: {
          label: componentDefinition?.label || type,
          type: type,
          status: initialStatus,
          description:
            componentDefinition?.description || "Example component description",
          instanceType: "",
          githubUrl:
            componentDefinition?.githubUrl ||
            "https://github.com/example/gcp-component",
          consoleUrl:
            componentDefinition?.consoleUrl ||
            "https://console.cloud.google.com/home/dashboard",
          customFields,
          ...azureFields, // Spread Azure fields for Azure nodes
          ...kubernetesFields, // Spread Kubernetes fields for Kubernetes nodes  
          ...kafkaFields, // Spread Kafka fields for Kafka nodes
          ...gcpFields, // Spread GCP fields for GCP nodes
          metrics: {
            cpu: Math.floor(Math.random() * 100),
            memory: Math.floor(Math.random() * 100),
            disk: Math.floor(Math.random() * 100),
            network: Math.floor(Math.random() * 100),
            lastUpdated: new Date().toISOString(),
            activeAlerts: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
            alertSeverity: Math.random() > 0.5 ? 'critical' : 'warning',
          },
          logs: [
            {
              timestamp: new Date().toISOString(),
              message: "Component initialized",
              level: "info",
            },
          ],
        },
        className: "dark:bg-background dark:text-foreground",
        style: {
          borderRadius: "8px",
          minWidth: 180,
        },
      };

      setPendingNode(newNode);
      setShowNodeConfig(true);
    },
    [rfInstance],
  );

  const handleSaveNodeConfig = (nodeData: any) => {
    if (pendingNode) {
      const finalNode = {
        ...pendingNode,
        data: nodeData
      };
      setNodes((nds) => nds.concat(finalNode));
      setPendingNode(null);
      setShowNodeConfig(false);
    }
  };

  const handleCancelNodeConfig = () => {
    setPendingNode(null);
    setShowNodeConfig(false);
  };

  // New map handler
  const handleCreateNewMap = (data: NewMapData) => {
    setCurrentMapMetadata(data);
    setCurrentMapId(null); // Clear map ID since this is a new map
    setNodes([]);
    setEdges([]);
    setShowNewMapDialog(false);
    toast({
      title: 'Success',
      description: `New map "${data.name}" created!`,
    });
  };

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      onNodeSelected?.();
    },
    [setSelectedNode, onNodeSelected],
  );

  return (
    <div className="h-full w-full bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: "hsl(var(--primary))" }}
        fitView
      >
        <Background className="dark:bg-muted/20" />
        <div className="absolute bottom-5 left-4 size-16">
          <Controls className="dark:bg-background dark:border-border" />
        </div>
      </ReactFlow>

      {/* Dialogs */}
      <SaveMapDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveMap}
        nodes={nodes as ReactFlowNode[]}
        edges={edges as ReactFlowEdge[]}
        isLoading={isSaving}
        initialData={currentMapMetadata || undefined}
        isUpdate={!!currentMapId}
      />

      <TelemetryMapsLibrary
        isOpen={showLibraryDialog}
        onClose={() => setShowLibraryDialog(false)}
        onLoadMap={handleLoadMap}
        userId={currentUserId}
      />

      <NodeConfigDialog
        isOpen={showNodeConfig}
        onClose={handleCancelNodeConfig}
        onSave={handleSaveNodeConfig}
        initialNode={pendingNode}
      />

      <NewMapDialog
        isOpen={showNewMapDialog}
        onClose={() => setShowNewMapDialog(false)}
        onCreate={handleCreateNewMap}
      />
    </div>
  );
}
