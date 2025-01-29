import ReactFlow, {
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
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
    setNodes(applyNodeChanges(changes, nodes));
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges(applyEdgeChanges(changes, edges || []));
  }, [edges, setEdges]);

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds || []));
  }, [setEdges]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type: 'default',
      position: { x: event.clientX - 250, y: event.clientY - 100 },
      data: { label: type },
    };

    setNodes((nds) => [...(nds || []), newNode]);
  }, [setNodes]);

  return (
    <ReactFlow
      nodes={nodes || []}
      edges={edges || []}
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