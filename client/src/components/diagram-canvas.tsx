import { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Connection,
  Edge,
  ReactFlowInstance,
  Node,
  addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useDiagramStore } from '@/lib/diagram-store';

export default function DiagramCanvas() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setRfInstance,
    setSelectedNode
  } = useDiagramStore();

  const onNodesChange = useCallback((changes: any) => {
    setNodes(
      changes.reduce((acc: Node[], change: any) => {
        if (change.type === 'position' || change.type === 'dimensions') {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            return [...acc, { ...node, position: change.position || node.position }];
          }
        }
        return acc;
      }, []) || nodes
    );
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges(
      changes.reduce((acc: Edge[], change: any) => {
        if (change.type === 'remove') {
          return acc.filter((e) => e.id !== change.id);
        }
        return acc;
      }, edges)
    );
  }, [edges, setEdges]);

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
      if (!type) return;

      const position = {
        x: event.clientX,
        y: event.clientY
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: { label: type, icon: type },
      };

      setNodes([...nodes, newNode]);
    },
    [nodes, setNodes]
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