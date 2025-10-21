import { useCallback, useState } from "react";
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
  Handle,
  Position,
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
import { Button } from "@/components/ui/button";
import { Save, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Add custom component definition.  This is an example and needs to be adapted to your actual custom components.
const customComponents = [
  {
    type: "custom_component_1",
    label: "Custom Component 1",
    icon: () => <div>Custom Icon 1</div>,
    fields: [
      {
        name: "field1",
        label: "Field 1",
        type: "text",
        defaultValue: "default value 1",
      },
      { name: "field2", label: "Field 2", type: "number", defaultValue: 0 },
    ],
  },
  // Add more custom components here...
];

interface DiagramCanvasProps {
  onNodeSelected?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "hsl(var(--success))";
    case "warning":
      return "hsl(var(--warning))";
    case "error":
      return "hsl(var(--destructive))";
    case "inactive":
      return "hsl(var(--muted))";
    default:
      return "hsl(var(--border))";
  }
};

const CustomNode = ({ data }: { data: any }) => {
  const components = getCloudComponents();
  const Component = components.find((comp) => comp.type === data.type)?.icon;

  return (
    <div className="relative p-2 rounded-md bg-background border text-foreground shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !-left-1.5 !border-2 !bg-background hover:!bg-muted"
        style={{ zIndex: 1 }}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {Component && <Component className="w-5 h-5" />}
          <span className="text-sm font-medium">{data.label}</span>
        </div>

        {/* Custom Fields Section */}
        {data.customFields && data.customFields.length > 0 && (
          <div className="border-t pt-2 mt-1 space-y-1">
            {data.customFields.map((field: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{field.name}:</span>
                <span className="font-medium">
                  {field.type === "select" ? (
                    <span className="px-1.5 py-0.5 bg-accent/50 rounded-sm">
                      {field.value || "(Not set)"}
                    </span>
                  ) : field.type === "url" ? (
                    <a
                      href={field.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {field.value ? "Link" : "(Not set)"}
                    </a>
                  ) : (
                    field.value || "(Not set)"
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !-right-1.5 !border-2 !bg-background hover:!bg-muted"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};

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

export default function DiagramCanvas({ onNodeSelected }: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { setSelectedNode } = useDiagramStore();
  
  // Save/Load state
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLibraryDialog, setShowLibraryDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId] = useState('user123'); // Replace with actual user authentication
  
  const { toast } = useToast();

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

      await TelemetryMapService.createTelemetryMap(mapData, currentUserId);
      setShowSaveDialog(false);
      toast({
        title: 'Success',
        description: 'Telemetry map saved successfully!',
      });
    } catch (error) {
      console.error('Failed to save map:', error);
      toast({
        title: 'Error',
        description: 'Failed to save telemetry map. Please try again.',
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
        border: `2px solid ${getStatusColor(node.status)}`,
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
            activeAlerts: Math.floor(Math.random() * 5),
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
          border: `2px solid ${getStatusColor(initialStatus)}`,
          borderRadius: "8px",
          minWidth: 180,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes],
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      onNodeSelected?.();
    },
    [setSelectedNode, onNodeSelected],
  );

  return (
    <div className="h-full w-full bg-background relative">
      {/* Save/Load Buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLibraryDialog(true)}
        >
          <FolderOpen className="h-4 w-4 mr-2" />
          Load Map
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          disabled={nodes.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Map
        </Button>
      </div>

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
      />

      <TelemetryMapsLibrary
        isOpen={showLibraryDialog}
        onClose={() => setShowLibraryDialog(false)}
        onLoadMap={handleLoadMap}
        userId={currentUserId}
      />
    </div>
  );
}
