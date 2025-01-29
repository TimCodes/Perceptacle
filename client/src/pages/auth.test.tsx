import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import AuthPage from './auth';
import { useAuthStore } from '@/lib/auth-store';

// Mock the auth store
jest.mock('@/lib/auth-store', () => ({
  useAuthStore: jest.fn(),
}));

// Mock wouter's useLocation
jest.mock('wouter', () => ({
  useLocation: () => ['/auth', jest.fn()],
}));

describe('AuthPage', () => {
  const mockLogin = jest.fn();
  const mockRegister = jest.fn();

  beforeEach(() => {
    (useAuthStore as jest.Mock).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      loading: false,
    });
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

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('switches to register form when clicking register link', async () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    fireEvent.click(screen.getByText(/Don't have an account\? Register/i));

    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('validates form fields before submission', async () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    const submitButton = screen.getByText('Login');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with correct credentials', async () => {
    render(
      <ChakraProvider>
        <AuthPage />
      </ChakraProvider>
    );

    const username = screen.getByLabelText('Username');
    const password = screen.getByLabelText('Password');

    fireEvent.change(username, { target: { value: 'testuser' } });
    fireEvent.change(password, { target: { value: 'password123' } });

    const submitButton = screen.getByText('Login');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
});
