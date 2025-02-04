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
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, HStack, Text } from '@chakra-ui/react';
import { useDiagramStore } from '@/lib/diagram-store';
import { GCPComponents } from '@/lib/gcp-components';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#48BB78';
    case 'warning':
      return '#ECC94B';
    case 'error':
      return '#E53E3E';
    case 'inactive':
      return '#A0AEC0';
    default:
      return '#CBD5E0';
  }
};

const CustomNode = ({ data }: { data: any }) => {
  const Icon = GCPComponents.find(comp => comp.type === data.icon)?.icon;

  return (
    <Box p={2}>
      <HStack spacing={2} alignItems="center">
        {Icon && <Icon size={20} />}
        <Text fontSize="sm">{data.label}</Text>
      </HStack>
    </Box>
  );
};

const nodeTypes = {
  default: CustomNode,
};

export default function DiagramCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const { setSelectedNode } = useDiagramStore();

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
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
      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: { 
          label: type,
          icon: type,
          status: initialStatus,
          description: 'Example component description',
          instanceType: '',
          githubUrl: 'https://github.com/example/gcp-component',
          consoleUrl: 'https://console.cloud.google.com/home/dashboard',
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
        style: {
          background: '#ffffff',
          border: `2px solid ${getStatusColor(initialStatus)}`,
          borderRadius: '4px',
          width: 180
        }
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [rfInstance, setNodes]
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  return (
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
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}