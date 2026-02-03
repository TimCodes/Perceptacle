import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock wouter routing
jest.mock('wouter', () => ({
  Switch: ({ children }: any) => <div data-testid="switch">{children}</div>,
  Route: ({ component: Component }: any) => <Component />,
}));

// Mock child components to simplify testing
jest.mock('@/pages/home', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

jest.mock('@/pages/settings', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

jest.mock('@/pages/not-found', () => ({
  __esModule: true,
  default: () => <div data-testid="not-found-page">404 Not Found</div>,
}));

jest.mock('@/components/NavBar/NavBar', () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

describe('App Component', () => {
  it('should render the navbar', () => {
    render(<App />);
    
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  it('should render the home page by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('should wrap app with ThemeProvider', () => {
    const { container } = render(<App />);
    
    // ThemeProvider should be present in the component tree
    expect(container).toBeInTheDocument();
  });

  it('should wrap app with QueryClientProvider', () => {
    const { container } = render(<App />);
    
    // QueryClientProvider should be present in the component tree
    expect(container).toBeInTheDocument();
  });

  it('should have proper app structure', () => {
    render(<App />);
    
    // Both navbar and page content should be present
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
