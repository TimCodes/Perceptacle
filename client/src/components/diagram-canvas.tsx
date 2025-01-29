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
import { useDiagramStore } from '@/lib/diagram-store';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return '#48BB78'; // green.500
    case 'warning':
      return '#ECC94B'; // yellow.500
    case 'error':
      return '#E53E3E'; // red.500
    case 'inactive':
      return '#A0AEC0'; // gray.500
    default:
      return '#CBD5E0'; // gray.300
  }
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
          // Add dummy URLs for testing
          githubUrl: 'https://github.com/example/gcp-component',
          consoleUrl: 'https://console.cloud.google.com/home/dashboard'
        },
        style: {
          background: '#ffffff',
          border: `2px solid ${getStatusColor(initialStatus)}`,
          borderRadius: '4px',
          padding: '10px'
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
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}