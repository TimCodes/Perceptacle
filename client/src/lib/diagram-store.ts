import { create } from 'zustand';
import { Node, Edge, ReactFlowInstance } from 'reactflow';

interface DiagramState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  rfInstance: ReactFlowInstance | null;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setSelectedNode: (node: Node | null) => void;
  setRfInstance: (instance: ReactFlowInstance) => void;
  updateSelectedNode: (node: Node) => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
  clearDiagram: () => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [] as Node[],
  edges: [] as Edge[],
  selectedNode: null,
  rfInstance: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node }),
  setRfInstance: (instance) => set({ rfInstance: instance }),

  updateSelectedNode: (node) => {
    const { nodes, selectedNode } = get();
    if (!selectedNode) return;

    const updatedNodes = nodes.map((n) =>
      n.id === selectedNode.id ? node : n
    );

    set({
      nodes: updatedNodes,
      selectedNode: node
    });
  },

  saveDiagram: () => {
    const { nodes, edges } = get();
    const flow = { nodes, edges };
    localStorage.setItem('gcp-diagram', JSON.stringify(flow));
  },

  loadDiagram: () => {
    const flow = localStorage.getItem('gcp-diagram');
    if (flow) {
      const { nodes, edges } = JSON.parse(flow);
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