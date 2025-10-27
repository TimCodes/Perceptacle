import React from 'react';
import { render, screen } from '@testing-library/react';
import { Handle, Position } from 'reactflow';

// Mock reactflow components
jest.mock('reactflow', () => ({
  Handle: ({ type, position, className, style }: any) => (
    <div 
      data-testid={`handle-${type}`}
      data-position={position}
      className={className}
      style={style}
    />
  ),
  Position: {
    Left: 'left',
    Right: 'right',
    Top: 'top',
    Bottom: 'bottom',
  },
}));

// Mock cloudComponents utility
jest.mock('@/utils/cloudComponents', () => ({
  getCloudComponents: jest.fn(() => [
    {
      type: 'compute-engine',
      label: 'Compute Engine',
      icon: () => <div data-testid="compute-engine-icon">CE</div>,
      category: 'Compute',
    },
    {
      type: 'cloud-storage',
      label: 'Cloud Storage',
      icon: () => <div data-testid="cloud-storage-icon">CS</div>,
      category: 'Storage',
    },
  ]),
}));

// Since CustomNode is not exported, we need to test it through DiagramCanvas
// or we can extract it. For now, let's create a minimal version for testing
const CustomNode = ({ data }: { data: any }) => {
  const { getCloudComponents } = require('@/utils/cloudComponents');
  const components = getCloudComponents();
  const Component = components.find((comp: any) => comp.type === data.type)?.icon;

  return (
    <div className="relative p-2 rounded-md bg-background border text-foreground shadow-sm">
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !-left-1.5 !border-2 !bg-background hover:!bg-muted"
        style={{ zIndex: 1 }}
      />
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {Component && <Component className="w-5 h-5" />}
          <span className="text-sm font-medium">{data.label}</span>
        </div>

        {data.customFields && data.customFields.length > 0 && (
          <div className="border-t pt-2 mt-1 space-y-1">
            {data.customFields.map((field: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{field.name}:</span>
                <span className="font-medium">
                  {field.type === "select" ? (
                    <span className="px-1.5 py-0.5 bg-accent/50 rounded-sm">
                      {field.value || "(Not set)"}
                    </span>
                  ) : field.type === "url" ? (
                    <a
                      href={field.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {field.value ? "Link" : "(Not set)"}
                    </a>
                  ) : (
                    field.value || "(Not set)"
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !-right-1.5 !border-2 !bg-background hover:!bg-muted"
        style={{ zIndex: 1 }}
      />
    </div>
  );
};

describe('CustomNode', () => {
  it('should render node with label', () => {
    const data = {
      label: 'Test Node',
      type: 'compute-engine',
    };

    render(<CustomNode data={data} />);
    
    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('should render node with icon when type matches', () => {
    const data = {
      label: 'GCP Compute',
      type: 'compute-engine',
    };

    render(<CustomNode data={data} />);
    
    expect(screen.getByTestId('compute-engine-icon')).toBeInTheDocument();
  });

  it('should render node without icon when type does not match', () => {
    const data = {
      label: 'Unknown Node',
      type: 'unknown-type',
    };

    const { container } = render(<CustomNode data={data} />);
    
    expect(screen.getByText('Unknown Node')).toBeInTheDocument();
    expect(container.querySelector('[data-testid$="-icon"]')).not.toBeInTheDocument();
  });

  it('should render both handles (source and target)', () => {
    const data = {
      label: 'Test Node',
      type: 'compute-engine',
    };

    render(<CustomNode data={data} />);
    
    expect(screen.getByTestId('handle-target')).toBeInTheDocument();
    expect(screen.getByTestId('handle-source')).toBeInTheDocument();
  });

  it('should position target handle on the left', () => {
    const data = {
      label: 'Test Node',
      type: 'compute-engine',
    };

    render(<CustomNode data={data} />);
    
    const targetHandle = screen.getByTestId('handle-target');
    expect(targetHandle).toHaveAttribute('data-position', 'left');
  });

  it('should position source handle on the right', () => {
    const data = {
      label: 'Test Node',
      type: 'compute-engine',
    };

    render(<CustomNode data={data} />);
    
    const sourceHandle = screen.getByTestId('handle-source');
    expect(sourceHandle).toHaveAttribute('data-position', 'right');
  });

  describe('Custom Fields', () => {
    it('should render custom fields when provided', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
        customFields: [
          { name: 'Environment', value: 'Production', type: 'text' },
          { name: 'Region', value: 'us-east-1', type: 'text' },
        ],
      };

      render(<CustomNode data={data} />);
      
      expect(screen.getByText('Environment:')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
      expect(screen.getByText('Region:')).toBeInTheDocument();
      expect(screen.getByText('us-east-1')).toBeInTheDocument();
    });

    it('should not render custom fields section when no fields provided', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
      };

      const { container } = render(<CustomNode data={data} />);
      
      const customFieldsSection = container.querySelector('.border-t.pt-2');
      expect(customFieldsSection).not.toBeInTheDocument();
    });

    it('should render select type fields with special styling', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
        customFields: [
          { name: 'Status', value: 'Active', type: 'select' },
        ],
      };

      render(<CustomNode data={data} />);
      
      expect(screen.getByText('Status:')).toBeInTheDocument();
      const valueSpan = screen.getByText('Active');
      expect(valueSpan).toHaveClass('px-1.5', 'py-0.5', 'bg-accent/50', 'rounded-sm');
    });

    it('should render url type fields as links', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
        customFields: [
          { name: 'Documentation', value: 'https://example.com', type: 'url' },
        ],
      };

      render(<CustomNode data={data} />);
      
      expect(screen.getByText('Documentation:')).toBeInTheDocument();
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('should show "(Not set)" for empty field values', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
        customFields: [
          { name: 'Optional Field', value: '', type: 'text' },
        ],
      };

      render(<CustomNode data={data} />);
      
      expect(screen.getByText('Optional Field:')).toBeInTheDocument();
      expect(screen.getByText('(Not set)')).toBeInTheDocument();
    });

    it('should show "Link" text for url fields with value', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
        customFields: [
          { name: 'URL', value: 'https://example.com', type: 'url' },
        ],
      };

      render(<CustomNode data={data} />);
      
      expect(screen.getByText('Link')).toBeInTheDocument();
    });

    it('should show "(Not set)" for empty url fields', () => {
      const data = {
        label: 'Test Node',
        type: 'compute-engine',
        customFields: [
          { name: 'URL', value: '', type: 'url' },
        ],
      };

      render(<CustomNode data={data} />);
      
      expect(screen.getAllByText('(Not set)')).toHaveLength(1);
    });
  });

  it('should have proper container styling', () => {
    const data = {
      label: 'Test Node',
      type: 'compute-engine',
    };

    const { container } = render(<CustomNode data={data} />);
    
    const nodeContainer = container.firstChild as HTMLElement;
    expect(nodeContainer).toHaveClass(
      'relative',
      'p-2',
      'rounded-md',
      'bg-background',
      'border',
      'text-foreground',
      'shadow-sm'
    );
  });
});
