import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyPanel from '../EmptyPanel';

describe('EmptyPanel', () => {
  it('should render the empty panel message', () => {
    render(<EmptyPanel />);
    
    expect(screen.getByText(/select a node to configure its properties/i)).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<EmptyPanel />);
    
    const panelDiv = container.firstChild as HTMLElement;
    expect(panelDiv).toHaveClass('w-[325px]', 'p-4', 'border-l');
  });

  it('should render text with muted foreground color', () => {
    const { container } = render(<EmptyPanel />);
    
    const text = screen.getByText(/select a node to configure its properties/i);
    expect(text).toHaveClass('text-muted-foreground');
  });
});
