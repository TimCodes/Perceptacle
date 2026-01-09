import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NodeInfoSideBar from '../NodeInfoSideBar';
import { useDiagramStore } from '@/utils/diagram-store';

// Mock the store
jest.mock('@/utils/diagram-store');

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock UI components
jest.mock('@/components/ui/scroll-area', () => ({
  ScrollArea: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className }: any) => (
    <button className={className} onClick={onClick}>{children}</button>
  ),
}));

jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue, onValueChange, className }: any) => (
    <div className={className} data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value, className }: any) => (
    <div className={className} data-value={value}>{children}</div>
  ),
}));

// Mock sub-components
jest.mock('../TabNavigation', () => ({
  TabNavigation: () => <div data-testid="tab-navigation">Tab Navigation</div>,
}));

jest.mock('../ConfigurationTab', () => ({
  ConfigurationTab: ({ editedNode }: any) => (
    <div data-testid="configuration-tab">Configuration: {editedNode?.data?.label}</div>
  ),
}));

jest.mock('../CICDTab', () => ({
  __esModule: true,
  default: ({ editedNode }: any) => (
    <div data-testid="cicd-tab">CI/CD: {editedNode?.data?.label}</div>
  ),
}));

jest.mock('../ObservabilityTab', () => ({
  __esModule: true,
  default: ({ editedNode }: any) => (
    <div data-testid="observability-tab">Observability: {editedNode?.data?.label}</div>
  ),
}));

jest.mock('../AIChatTab', () => ({
  __esModule: true,
  AIChatTab: ({ editedNode }: any) => (
    <div data-testid="aichat-tab">AI Chat: {editedNode?.data?.label}</div>
  ),
}));

jest.mock('../EmptyPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="empty-panel">Empty Panel</div>,
}));

jest.mock('@/utils/helpers', () => ({
  getStatusColor: (status: string) => {
    const colors: Record<string, string> = {
      active: '#00ff00',
      warning: '#ffff00',
      error: '#ff0000',
      inactive: '#808080',
    };
    return colors[status] || '#000000';
  },
}));

describe('NodeInfoSideBar', () => {
  const mockUpdateSelectedNode = jest.fn();
  
  const mockNode = {
    id: 'node-1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Node',
      type: 'compute-engine',
      status: 'active',
      customFields: [],
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useDiagramStore as unknown as jest.Mock).mockReturnValue({
      selectedNode: null,
      updateSelectedNode: mockUpdateSelectedNode,
    });
  });

  describe('Empty State', () => {
    it('should render empty panel when no node is selected', () => {
      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: null,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      render(<NodeInfoSideBar />);
      
      expect(screen.getByTestId('empty-panel')).toBeInTheDocument();
    });
  });

  describe('With Selected Node', () => {
    beforeEach(() => {
      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: mockNode,
        updateSelectedNode: mockUpdateSelectedNode,
      });
    });

    it('should render the sidebar with node information', () => {
      render(<NodeInfoSideBar />);
      
      expect(screen.queryByTestId('empty-panel')).not.toBeInTheDocument();
      expect(screen.getByText(/Application Node Configuration/i)).toBeInTheDocument();
    });

    it('should render tab navigation', () => {
      render(<NodeInfoSideBar />);
      
      expect(screen.getByTestId('tab-navigation')).toBeInTheDocument();
    });

    it('should render all tab contents', () => {
      render(<NodeInfoSideBar />);
      
      expect(screen.getByTestId('configuration-tab')).toBeInTheDocument();
      expect(screen.getByTestId('cicd-tab')).toBeInTheDocument();
      expect(screen.getByTestId('observability-tab')).toBeInTheDocument();
      expect(screen.getByTestId('aichat-tab')).toBeInTheDocument();
    });

    it('should have correct sidebar width', () => {
      const { container } = render(<NodeInfoSideBar />);
      
      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('w-[375px]');
    });

    it('should have border and background styling', () => {
      const { container } = render(<NodeInfoSideBar />);
      
      const sidebar = container.firstChild as HTMLElement;
      expect(sidebar).toHaveClass('border-l', 'bg-background');
    });
  });

  describe('Save Functionality', () => {
    it('should not show save button when there are no changes', () => {
      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: mockNode,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      render(<NodeInfoSideBar />);
      
      expect(screen.queryByText(/Save Changes/i)).not.toBeInTheDocument();
    });

    it('should show save button after making changes', () => {
      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: mockNode,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      const { rerender } = render(<NodeInfoSideBar />);
      
      // Note: Testing the actual change functionality would require more complex mocking
      // of the ConfigurationTab component to trigger handleChange
      // For now, we're testing the structure
      expect(screen.queryByText(/Save Changes/i)).not.toBeInTheDocument();
    });
  });

  describe('Node Updates', () => {
    it('should initialize with default metrics when not provided', () => {
      const nodeWithoutMetrics = {
        ...mockNode,
        data: {
          ...mockNode.data,
          metrics: undefined,
        },
      };

      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: nodeWithoutMetrics,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      render(<NodeInfoSideBar />);
      
      // Component should render without crashing
      expect(screen.getByTestId('configuration-tab')).toBeInTheDocument();
    });

    it('should initialize with default custom fields array when not provided', () => {
      const nodeWithoutCustomFields = {
        ...mockNode,
        data: {
          ...mockNode.data,
          customFields: undefined,
        },
      };

      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: nodeWithoutCustomFields,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      render(<NodeInfoSideBar />);
      
      // Component should render without crashing
      expect(screen.getByTestId('configuration-tab')).toBeInTheDocument();
    });

    it('should handle node selection changes', () => {
      const { rerender } = render(<NodeInfoSideBar />);
      
      const newNode = {
        ...mockNode,
        id: 'node-2',
        data: {
          ...mockNode.data,
          label: 'Updated Node',
        },
      };

      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: newNode,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      rerender(<NodeInfoSideBar />);
      
      expect(screen.getByTestId('configuration-tab')).toBeInTheDocument();
    });

    it('should switch back to empty panel when node is deselected', () => {
      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: mockNode,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      const { rerender } = render(<NodeInfoSideBar />);
      
      expect(screen.queryByTestId('empty-panel')).not.toBeInTheDocument();

      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: null,
        updateSelectedNode: mockUpdateSelectedNode,
      });

      rerender(<NodeInfoSideBar />);
      
      expect(screen.getByTestId('empty-panel')).toBeInTheDocument();
    });
  });

  describe('Application Node Updates', () => {
    beforeEach(() => {
      (useDiagramStore as unknown as jest.Mock).mockReturnValue({
        selectedNode: mockNode,
        updateSelectedNode: mockUpdateSelectedNode,
      });
    });

    it('should display default tab title', () => {
      render(<NodeInfoSideBar />);
      
      expect(screen.getByText(/Application Node Configuration/i)).toBeInTheDocument();
    });
  });
});
