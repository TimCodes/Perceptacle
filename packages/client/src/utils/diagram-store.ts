import { create } from 'zustand';
import { Node, Edge, ReactFlowInstance } from 'reactflow';

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  rfInstance: ReactFlowInstance | null;
  ownerFilter: string | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  setRfInstance: (instance: ReactFlowInstance) => void;
  setOwnerFilter: (filter: string | null) => void;
  updateSelectedNode: (node: Node) => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
  clearDiagram: () => void;
  addNodeLog: (nodeId: string, message: string, level?: 'info' | 'warning' | 'error') => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  rfInstance: null,
  ownerFilter: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setRfInstance: (instance) => set({ rfInstance: instance }),
  setOwnerFilter: (filter) => set({ ownerFilter: filter }),

  updateSelectedNode: (node) => {
    const { nodes, selectedNode } = get();
    if (!selectedNode) return;

    // Only update if the node actually changed
    const existingNode = nodes.find(n => n.id === selectedNode.id);
    if (existingNode && JSON.stringify(existingNode) === JSON.stringify(node)) {
      return; // No actual changes, skip update to prevent infinite loops
    }

    const updatedNodes = nodes.map((n) =>
      n.id === selectedNode.id ? node : n
    );

    set({
      nodes: updatedNodes,
      selectedNode: node
    });
  },

  addNodeLog: (nodeId: string, message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    const { nodes } = get();
    const updatedNodes = nodes.map((node) => {
      if (node.id === nodeId) {
        const logs = [...(node.data.logs || []), {
          timestamp: new Date().toISOString(),
          message,
          level
        }];
        // Keep only the last 100 logs
        if (logs.length > 100) logs.shift();
        return {
          ...node,
          data: {
            ...node.data,
            logs
          }
        };
      }
      return node;
    });
    set({ nodes: updatedNodes });
  },

  saveDiagram: () => {
    const { rfInstance } = get();
    if (!rfInstance) return;

    const flow = rfInstance.toObject();
    localStorage.setItem('gcp-diagram', JSON.stringify(flow));
  },

  loadDiagram: () => {
    const { rfInstance } = get();
    if (!rfInstance) return;

    const flow = localStorage.getItem('gcp-diagram');
    if (flow) {
      const { nodes, edges } = JSON.parse(flow);
      rfInstance.setNodes(nodes);
      rfInstance.setEdges(edges);
      set({ nodes, edges });
    }
  },

  clearDiagram: () => {
    set({
      nodes: [],
      edges: [],
      selectedNode: null
    });
  }
}));