import { useState, useCallback } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import ComponentLibrary from '@/components/ComponentLibrary';
import Canvas from '@/components/Canvas';
import ConfigPanel from '@/components/ConfigPanel';
import DiagramToolbar from '@/components/DiagramToolbar';
import { loadDiagram } from '@/lib/diagramStorage';
import { Node, Edge } from 'reactflow';

export default function DiagramEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const updatedNodes = changes.reduce((acc: Node[], change: any) => {
        if (change.type === 'position' || change.type === 'dimensions') {
          const node = nds.find((n) => n.id === change.id);
          if (node) {
            return [...acc, { ...node, position: change.position || node.position }];
          }
        }
        return acc;
      }, []);
      return updatedNodes.length ? updatedNodes : nds;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const updatedEdges = changes.reduce((acc: Edge[], change: any) => {
        if (change.type === 'remove') {
          return acc.filter((e) => e.id !== change.id);
        }
        return acc;
      }, eds);
      return updatedEdges;
    });
  }, []);

  const onConnect = useCallback((connection: any) => {
    setEdges((eds) => [...eds, connection]);
  }, []);

  const onNodeSelect = useCallback((node: Node | null) => {
    setSelectedNode(node);
  }, []);

  const onSave = useCallback((name: string) => {
    const diagram = { nodes, edges, name };
    localStorage.setItem(`diagram-${name}`, JSON.stringify(diagram));
  }, [nodes, edges]);

  const onLoad = useCallback((name: string) => {
    const diagram = loadDiagram(name);
    if (diagram) {
      setNodes(diagram.nodes);
      setEdges(diagram.edges);
    }
  }, []);

  const onClear = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  }, []);

  const onNodeUpdate = useCallback((updatedNode: Node) => {
    setNodes(nodes.map(node => 
      node.id === updatedNode.id ? updatedNode : node
    ));
    setSelectedNode(updatedNode);
  }, [nodes]);

  return (
    <Flex h="100vh" bg="gray.50">
      <ComponentLibrary setNodes={setNodes} />

      <Flex direction="column" flex={1}>
        <DiagramToolbar 
          onSave={onSave} 
          onLoad={onLoad}
          onClear={onClear}
        />

        <Box flex={1}>
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeSelect={onNodeSelect}
          />
        </Box>
      </Flex>

      <ConfigPanel 
        selectedNode={selectedNode}
        onNodeUpdate={onNodeUpdate}
      />
    </Flex>
  );
}