import { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComponentLibrary from '@/components/ComponentLibrary';
import Canvas from '@/components/Canvas';
import ConfigPanel from '@/components/config-panel';
import DiagramToolbar from '@/components/DiagramToolbar';
import { loadDiagram } from '@/lib/diagramStorage';
import { startMockLogGenerator } from '@/lib/mock-log-generator';
import { Node, Edge } from 'reactflow';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MotionDiv = motion.div;

export default function DiagramEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isComponentMenuOpen, setIsComponentMenuOpen] = useState(true);

  useEffect(() => {
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
    <div className="h-screen grid grid-cols-[auto_1fr_auto]">
      <AnimatePresence initial={false}>
        <MotionDiv
          className={cn(
            "relative bg-background border-r",
            "overflow-hidden"
          )}
          initial={false}
          animate={{
            width: isComponentMenuOpen ? "250px" : "0px",
            opacity: isComponentMenuOpen ? 1 : 0,
          }}
          transition={{
            width: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
        >
          <ComponentLibrary setNodes={setNodes} />
          <Button
            variant="outline"
            size="sm"
            onClick={toggleComponentMenu}
            className={cn(
              "absolute -right-6 top-4 z-10",
              "rounded-l-none shadow-md"
            )}
          >
            {isComponentMenuOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </MotionDiv>
      </AnimatePresence>

      <div className="flex flex-col">
        <DiagramToolbar 
          onSave={onSave} 
          onLoad={onLoad}
          onClear={onClear}
        />

        <div className="flex-1">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeSelect={onNodeSelect}
          />
        </div>
      </div>

      {selectedNode && (
        <ConfigPanel 
          selectedNode={selectedNode}
          onNodeUpdate={onNodeUpdate}
        />
      )}
    </div>
  );
}