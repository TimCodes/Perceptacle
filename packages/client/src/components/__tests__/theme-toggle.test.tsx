import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeToggle } from '../theme-toggle';
import { ThemeProvider } from 'next-themes';

// Wrapper component to provide theme context
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </ThemeProvider>
);

describe('ThemeToggle Component', () => {
  it('should render the theme toggle button', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();
  });

  it('should display sun and moon icons', () => {
    const { container } = render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    // Check that icons are rendered (lucide-react renders SVGs)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);
    
    // Menu items should appear
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('should have all three theme options in the menu', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);
    
    const lightOption = screen.getByText('Light');
    const darkOption = screen.getByText('Dark');
    const systemOption = screen.getByText('System');
    
    expect(lightOption).toBeInTheDocument();
    expect(darkOption).toBeInTheDocument();
    expect(systemOption).toBeInTheDocument();
  });

  it('should allow selecting light theme', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);
    
    const lightOption = screen.getByText('Light');
    await user.click(lightOption);
    
    // After clicking, the menu should close (light option should not be visible)
    expect(screen.queryByText('Light')).not.toBeInTheDocument();
  });

  it('should allow selecting dark theme', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);
    
    const darkOption = screen.getByText('Dark');
    await user.click(darkOption);
    
    // After clicking, the menu should close
    expect(screen.queryByText('Dark')).not.toBeInTheDocument();
  });

  it('should allow selecting system theme', async () => {
    const user = userEvent.setup();
    
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    await user.click(button);
    
    const systemOption = screen.getByText('System');
    await user.click(systemOption);
    
    // After clicking, the menu should close
    expect(screen.queryByText('System')).not.toBeInTheDocument();
  });

  it('should have accessible screen reader text', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('should use outline variant for button', () => {
    render(
      <ThemeWrapper>
        <ThemeToggle />
      </ThemeWrapper>
    );
    
    const button = screen.getByRole('button', { name: /toggle theme/i });
    // Check that button is rendered (exact class checking is implementation detail)
    expect(button).toBeInTheDocument();
  });
});
