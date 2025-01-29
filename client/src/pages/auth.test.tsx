import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AuthPage from './auth';
import * as authStoreModule from '@/lib/auth-store';

// Mock the auth store module instead of the hook directly
jest.mock('@/lib/auth-store', () => ({
  useAuthStore: jest.fn()
}));

// Mock wouter's useLocation
jest.mock('wouter', () => ({
  useLocation: () => ['/auth', jest.fn()],
}));

describe('AuthPage', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();

  beforeEach(() => {
    // Cast the mock to any to avoid TypeScript errors
    (authStoreModule.useAuthStore as any).mockImplementation(() => ({
      login: mockLogin,
      register: mockRegister,
      loading: false,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it('switches to register form when clicking register link', () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    const registerLink = screen.getByText(/Don't have an account/i);
    fireEvent.click(registerLink);

    expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText(/Username is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with credentials', async () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
});