import { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeChange,
  EdgeChange,
  addEdge,
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
    setSelectedNode,
    addNode
  } = useDiagramStore();

  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes(
      changes.reduce((acc: Node[], change: NodeChange) => {
        if (change.type === 'position' || change.type === 'dimensions') {
          const node = nodes.find((n) => n.id === change.id);
          if (node) {
            return [...acc, { ...node, position: { ...node.position, ...change.position } }];
          }
        }
        return acc;
      }, []) || nodes
    );
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback((changes: EdgeChange[]) => {
    setEdges((eds) => {
      return changes.reduce((acc: Edge[], change: EdgeChange) => {
        if (change.type === 'remove') {
          return acc.filter((e) => e.id !== change.id);
        }
        return acc;
      }, eds);
    });
  }, [setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => {
        const newEdge = { ...connection, id: `e${connection.source}-${connection.target}` };
        return addEdge(newEdge, eds);
      });
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
      if (!type) return;

      // Calculate position relative to the canvas
      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      const position = reactFlowBounds 
        ? {
            x: event.clientX - reactFlowBounds.left - 200,
            y: event.clientY - reactFlowBounds.top - 60
          }
        : { x: 0, y: 0 };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'default',
        position,
        data: { label: type, icon: type },
      };

      addNode(newNode);
    },
    [addNode]
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