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
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  saveDiagram: () => void;
  loadDiagram: () => void;
  clearDiagram: () => void;
}

export const useDiagramStore = create<DiagramState>((set, get) => ({
  nodes: [],
  edges: [],
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

  deleteNode: (nodeId) => {
    const { nodes, edges } = get();
    const updatedNodes = nodes.filter((node) => node.id !== nodeId);
    const updatedEdges = edges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );

    set({
      nodes: updatedNodes,
      edges: updatedEdges,
      selectedNode: null
    });
  },

  duplicateNode: (nodeId) => {
    const { nodes } = get();
    const nodeToDuplicate = nodes.find((node) => node.id === nodeId);
    if (!nodeToDuplicate) return;

    const newNode = {
      ...nodeToDuplicate,
      id: `${nodeToDuplicate.type}-${Date.now()}`,
      position: {
        x: nodeToDuplicate.position.x + 50,
        y: nodeToDuplicate.position.y + 50
      }
    };

    set({
      nodes: [...nodes, newNode]
    });
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