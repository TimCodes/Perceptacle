import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigurationTab } from '../ConfigurationTab';

// Mock UI components
jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ value, onChange, placeholder, type, ...props }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder, rows }: any) => (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select" data-value={value}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <div data-value={value}>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => <span className={className}>{children}</span>,
}));

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children }: any) => <>{children}</>,
  TooltipContent: ({ children, side, className }: any) => (
    <div data-side={side} className={className}>{children}</div>
  ),
}));


jest.mock('@/utils/nodeConfigFields', () => ({
  getConfigFieldsForNodeType: (type: string) => {
    if (type === 'compute-engine') {
      return [
        {
          name: 'name',
          label: 'Name',
          type: 'text',
          required: true,
          placeholder: 'Enter name',
        },
        {
          name: 'description',
          label: 'Description',
          type: 'textarea',
          required: false,
          placeholder: 'Enter description',
        },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: ['active', 'inactive', 'error'],
          required: true,
        },
      ];
    }
    return [];
  },
}));

describe('ConfigurationTab', () => {
  const mockHandleChange = jest.fn();

  const mockNode = {
    id: 'node-1',
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
      label: 'Test Node',
      type: 'compute-engine',
      name: 'Test Name',
      description: 'Test Description',
      status: 'active',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render basic node information', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('should render required field indicator', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    // Find required indicators (asterisks)
    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBeGreaterThan(0);
  });

  it('should render text input fields', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter name');
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveValue('Test Name');
  });

  it('should render textarea fields', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    const descriptionTextarea = screen.getByPlaceholderText('Enter description');
    expect(descriptionTextarea).toBeInTheDocument();
    expect(descriptionTextarea).toHaveValue('Test Description');
  });

  it('should render select fields', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    const selectField = screen.getByTestId('select');
    expect(selectField).toBeInTheDocument();
    expect(selectField).toHaveAttribute('data-value', 'active');
  });

  it('should call handleChange when input value changes', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(mockHandleChange).toHaveBeenCalledWith('name', 'New Name');
  });

  it('should call handleChange when textarea value changes', () => {
    render(
      <ConfigurationTab
        editedNode={mockNode}
        handleChange={mockHandleChange}
        
      />
    );

    const descriptionTextarea = screen.getByPlaceholderText('Enter description');
    fireEvent.change(descriptionTextarea, { target: { value: 'New Description' } });

    expect(mockHandleChange).toHaveBeenCalledWith('description', 'New Description');
  });

  it('should render custom fields section', () => {
    const nodeWithCustomFields = {
      ...mockNode,
      data: {
        ...mockNode.data,
        customFields: [
          { name: 'field1', value: 'value1', type: 'text' },
        ],
      },
    };

    render(
      <ConfigurationTab
        editedNode={nodeWithCustomFields}
        handleChange={mockHandleChange}
        
      />
    );

    expect(screen.getByTestId('custom-fields-section')).toBeInTheDocument();
    expect(screen.getByText(/Custom Fields: 1/)).toBeInTheDocument();
  });

  it('should handle node with empty data fields', () => {
    const nodeWithEmptyData = {
      ...mockNode,
      data: {
        type: 'compute-engine',
        customFields: [],
      },
    };

    render(
      <ConfigurationTab
        editedNode={nodeWithEmptyData}
        handleChange={mockHandleChange}
        
      />
    );

    const nameInput = screen.getByPlaceholderText('Enter name');
    expect(nameInput).toHaveValue('');
  });

  it('should identify Azure nodes correctly', () => {
    const azureNode = {
      ...mockNode,
      data: {
        ...mockNode.data,
        type: 'azure-vm',
      },
    };

    const { container } = render(
      <ConfigurationTab
        editedNode={azureNode}
        handleChange={mockHandleChange}

      />
    );

    // Component should render without errors for Azure nodes
    // Check for Azure-specific badge or text
    expect(container).toBeTruthy();
    expect(screen.queryByText(/Azure Resource/i)).toBeInTheDocument();
  });

  it('should identify Kubernetes nodes correctly', () => {
    const k8sNode = {
      ...mockNode,
      data: {
        ...mockNode.data,
        type: 'k8s-pod',
      },
    };

    const { container } = render(
      <ConfigurationTab
        editedNode={k8sNode}
        handleChange={mockHandleChange}
        
      />
    );

    // Component should render without errors for K8s nodes
    // Check for Kubernetes-specific badge or text
    expect(container).toBeTruthy();
    expect(screen.queryByText(/Kubernetes Resource/i)).toBeInTheDocument();
  });

  it('should identify Kafka nodes correctly', () => {
    const kafkaNode = {
      ...mockNode,
      data: {
        ...mockNode.data,
        type: 'kafka-topic',
      },
    };

    const { container } = render(
      <ConfigurationTab
        editedNode={kafkaNode}
        handleChange={mockHandleChange}
        
      />
    );

    // Component should render without errors for Kafka nodes
    // Check for Kafka-specific badge or text
    expect(container).toBeTruthy();
    expect(screen.queryByText(/Kafka Resource/i)).toBeInTheDocument();
  });

  it('should render with GCP node types', () => {
    const gcpNode = {
      ...mockNode,
      data: {
        ...mockNode.data,
        type: 'compute-engine',
      },
    };

    render(
      <ConfigurationTab
        editedNode={gcpNode}
        handleChange={mockHandleChange}
        
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});
