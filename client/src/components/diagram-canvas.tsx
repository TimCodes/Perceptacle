import { useCallback, useState } from 'react';
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
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '@/lib/diagram-store';
import { getCloudComponents } from '@/lib/cloudComponents';

// Add custom component definition.  This is an example and needs to be adapted to your actual custom components.
const customComponents = [
  {
    type: 'custom_component_1',
    label: 'Custom Component 1',
    icon: () => <div>Custom Icon 1</div>,
    fields: [
      { name: 'field1', label: 'Field 1', type: 'text', defaultValue: 'default value 1' },
      { name: 'field2', label: 'Field 2', type: 'number', defaultValue: 0 },

    ]
  },
  // Add more custom components here...
];


interface DiagramCanvasProps {
  onNodeSelected?: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'hsl(var(--success))';
    case 'warning':
      return 'hsl(var(--warning))';
    case 'error':
      return 'hsl(var(--destructive))';
    case 'inactive':
      return 'hsl(var(--muted))';
    default:
      return 'hsl(var(--border))';
  }
};

const CustomNode = ({ data }: { data: any }) => {
  const components = getCloudComponents();
  const Component = components.find(comp => comp.type === data.type)?.icon;

  return (
    <div className="relative p-2 rounded-md bg-background border text-foreground shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !-left-1.5 !border-2 !bg-background hover:!bg-muted"
        style={{ zIndex: 1 }}
      />
      <div className="flex items-center gap-2">
        {Component && <Component className="w-5 h-5" />}
        <span className="text-sm font-medium">{data.label}</span>
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
  type: 'smoothstep',
  animated: true,
  style: { stroke: 'hsl(var(--primary))' },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'hsl(var(--primary))',
  },
};

export default function DiagramCanvas({ onNodeSelected }: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { setSelectedNode } = useDiagramStore();

  const onConnect = useCallback(
    (params: Connection) => {
      // Prevent self-connections
      if (params.source === params.target) {
        return;
      }

      setEdges((eds) =>
        addEdge({
          ...params,
          type: 'smoothstep',
          animated: true,
          style: { stroke: 'hsl(var(--primary))' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))',
          },
        }, eds)
      );
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (!type || !rfInstance) return;

      const position = rfInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const initialStatus = 'active';
      const componentType = type.replace(/-/g, '_');
      const components = getCloudComponents();
      const componentDefinition = components.find(
        (comp) => comp.type === componentType
      );

      const customFields = componentDefinition?.fields?.map((field) => ({
        ...field,
        value: field.defaultValue || '',
      })) || [];

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: {
          label: componentDefinition?.label || type,
          type: type,
          status: initialStatus,
          description: componentDefinition?.description || 'Example component description',
          instanceType: '',
          githubUrl: componentDefinition?.githubUrl || 'https://github.com/example/gcp-component',
          consoleUrl: componentDefinition?.consoleUrl || 'https://console.cloud.google.com/home/dashboard',
          customFields,
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
              message: 'Component initialized',
              level: 'info'
            }
          ]
        },
        className: 'dark:bg-background dark:text-foreground',
        style: {
          border: `2px solid ${getStatusColor(initialStatus)}`,
          borderRadius: '8px',
          minWidth: 180
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    onNodeSelected?.();
  }, [setSelectedNode, onNodeSelected]);

  return (
    <div className="h-full w-full bg-background">
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
        connectionLineStyle={{ stroke: 'hsl(var(--primary))' }}
        fitView
      >
        <Background className="dark:bg-muted/20" />
        <Controls className="dark:bg-background dark:border-border" />
      </ReactFlow>
    </div>
  );
}