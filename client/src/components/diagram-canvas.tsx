import ReactFlow, {
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  addEdge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCallback } from 'react';
import { useDiagramStore } from '@/lib/diagram-store';

export default function DiagramCanvas() {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setRfInstance,
    setSelectedNode,
  } = useDiagramStore();

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds: Node[]) => {
      return changes.reduce((acc: Node[], change: any) => {
        if (change.type === 'position') {
          const node = nds.find((n) => n.id === change.id);
          if (node) {
            return [...acc, { ...node, position: change.position }];
          }
        }
        return acc;
      }, nds);
    });
  }, [setNodes]);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds: Edge[]) => {
      return changes.reduce((acc: Edge[], change: any) => {
        if (change.type === 'remove') {
          return acc.filter((e) => e.id !== change.id);
        }
        return acc;
      }, eds);
    });
  }, [setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
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

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position: { x: event.clientX - 250, y: event.clientY - 100 },
        data: { label: type },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [setNodes]
  );

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
      onNodeClick={(_, node) => setSelectedNode(node)}
      fitView
    >
      <Background />
      <Controls />
    </ReactFlow>
  );
}