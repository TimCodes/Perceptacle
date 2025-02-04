import { useState, useCallback, useEffect } from 'react';
import { Box, Flex, IconButton, Collapse } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ComponentLibrary from '@/components/ComponentLibrary';
import Canvas from '@/components/Canvas';
import ConfigPanel from '@/components/config-panel';
import DiagramToolbar from '@/components/DiagramToolbar';
import { loadDiagram } from '@/lib/diagramStorage';
import { startMockLogGenerator } from '@/lib/mock-log-generator';
import { Node, Edge } from 'reactflow';

export default function DiagramEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isComponentMenuOpen, setIsComponentMenuOpen] = useState(true);

  useEffect(() => {
    // Start mock log generation and cleanup on unmount
    const cleanup = startMockLogGenerator();
    return () => cleanup();
  }, []);

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

  const toggleComponentMenu = () => {
    setIsComponentMenuOpen(!isComponentMenuOpen);
  };

  return (
    <Flex h="100vh" bg="gray.50">
      <Box position="relative" minW={isComponentMenuOpen ? "250px" : "0"} bg="white" borderRight="1px" borderColor="gray.200">
        <Collapse in={isComponentMenuOpen} style={{ display: 'flex' }}>
          <ComponentLibrary setNodes={setNodes} />
        </Collapse>
        <IconButton
          aria-label={isComponentMenuOpen ? "Close menu" : "Open menu"}
          icon={isComponentMenuOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          onClick={toggleComponentMenu}
          position="absolute"
          right="-10"
          top="4"
          zIndex="10"
          size="sm"
          variant="solid"
          bg="white"
          borderWidth={1}
          borderColor="gray.200"
          borderLeftRadius="0"
          shadow="md"
          _hover={{ bg: 'gray.50' }}
        />
      </Box>

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