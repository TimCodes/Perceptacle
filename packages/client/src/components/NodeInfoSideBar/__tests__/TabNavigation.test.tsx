import React from 'react';
import { render, screen } from '@testing-library/react';
import { TabNavigation } from '../TabNavigation';

// Mock the Tabs components from Radix UI
jest.mock('@/components/ui/tabs', () => ({
  TabsList: ({ children, className }: any) => <div className={className}>{children}</div>,
  TabsTrigger: ({ children, value, className }: any) => (
    <button className={className} data-value={value}>{children}</button>
  ),
}));

// Mock the Tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
  Tooltip: ({ children }: any) => <>{children}</>,
  TooltipTrigger: ({ children, asChild }: any) => <>{children}</>,
  TooltipContent: ({ children }: any) => <div>{children}</div>,
}));

describe('TabNavigation', () => {
  it('should render all four tab triggers', () => {
    const { container } = render(<TabNavigation />);
    
    const triggers = container.querySelectorAll('button[data-value]');
    expect(triggers).toHaveLength(4);
  });

  it('should render tabs in correct order', () => {
    const { container } = render(<TabNavigation />);
    
    const triggers = container.querySelectorAll('button[data-value]');
    expect(triggers[0]).toHaveAttribute('data-value', 'cicd');
    expect(triggers[1]).toHaveAttribute('data-value', 'observability');
    expect(triggers[2]).toHaveAttribute('data-value', 'tickets');
    expect(triggers[3]).toHaveAttribute('data-value', 'configuration');
  });

  it('should render with grid layout classes', () => {
    const { container } = render(<TabNavigation />);
    
    const tabsList = container.firstChild as HTMLElement;
    expect(tabsList).toHaveClass('grid', 'w-full', 'grid-cols-4');
  });

  it('should render all icons', () => {
    const { container } = render(<TabNavigation />);
    
    // Check that each tab trigger has an icon (lucide-react icons have a specific class)
    const triggers = container.querySelectorAll('button[data-value]');
    triggers.forEach(trigger => {
      const svg = trigger.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  it('should have tooltip content for each tab', () => {
    render(<TabNavigation />);
    
    // Tooltips render their content
    expect(screen.getByText('CI/CD')).toBeInTheDocument();
    expect(screen.getByText('Observability')).toBeInTheDocument();
    expect(screen.getByText('Tickets')).toBeInTheDocument();
    expect(screen.getByText('Configuration')).toBeInTheDocument();
  });
});
