import { render, screen } from '@testing-library/react';
import { StatCard } from '../StatCard';

describe('StatCard Component', () => {
  it('should render the label', () => {
    render(<StatCard label="CPU Usage" value="45%" progressValue={45} />);
    
    expect(screen.getByText('CPU Usage')).toBeInTheDocument();
  });

  it('should render the value', () => {
    render(<StatCard label="Memory" value="8GB" progressValue={80} />);
    
    expect(screen.getByText('8GB')).toBeInTheDocument();
  });

  it('should render both label and value together', () => {
    render(<StatCard label="Disk Space" value="120GB" progressValue={60} />);
    
    expect(screen.getByText('Disk Space')).toBeInTheDocument();
    expect(screen.getByText('120GB')).toBeInTheDocument();
  });

  it('should display numeric values correctly', () => {
    render(<StatCard label="Active Users" value="1,234" progressValue={75} />);
    
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('should handle zero progress value', () => {
    render(<StatCard label="Idle Time" value="0%" progressValue={0} />);
    
    expect(screen.getByText('Idle Time')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle maximum progress value', () => {
    render(<StatCard label="Maximum Load" value="100%" progressValue={100} />);
    
    expect(screen.getByText('Maximum Load')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should render with long label text', () => {
    const longLabel = 'Very Long Label That Describes System Metrics';
    render(<StatCard label={longLabel} value="50%" progressValue={50} />);
    
    expect(screen.getByText(longLabel)).toBeInTheDocument();
  });

  it('should have proper structure with container', () => {
    const { container } = render(<StatCard label="Test" value="Test Value" progressValue={50} />);
    
    const card = container.firstChild;
    expect(card).toHaveClass('p-4', 'rounded-lg', 'border', 'bg-card');
  });

  it('should render label with muted foreground styling', () => {
    render(<StatCard label="Network" value="45 Mbps" progressValue={45} />);
    
    const label = screen.getByText('Network');
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-muted-foreground');
  });

  it('should render value with bold styling', () => {
    render(<StatCard label="Storage" value="256GB" progressValue={70} />);
    
    const value = screen.getByText('256GB');
    expect(value).toHaveClass('text-2xl', 'font-bold');
  });
});
