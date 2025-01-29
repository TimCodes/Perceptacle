import { useAuthStore } from './auth-store';
import { act } from '@testing-library/react';

describe('useAuthStore', () => {
  beforeEach(() => {
    // Clear the store before each test
    act(() => {
      useAuthStore.setState({ user: null, loading: false });
    });
  });

  it('initializes with null user and not loading', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('sets loading state during login', async () => {
    const { login } = useAuthStore.getState();

    const loginPromise = login('testuser', 'password');
    expect(useAuthStore.getState().loading).toBe(true);

    await loginPromise;
    expect(useAuthStore.getState().loading).toBe(false);
  });

  it('sets user after successful login', async () => {
    const { login } = useAuthStore.getState();

    await login('testuser', 'password');
    const state = useAuthStore.getState();
    
    expect(state.user).toEqual({
      id: '1',
      username: 'testuser'
    });
  });

  it('clears user after logout', async () => {
    const { login, logout } = useAuthStore.getState();

    await login('testuser', 'password');
    await logout();
    
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });

  it('sets loading state during registration', async () => {
    const { register } = useAuthStore.getState();

    const registerPromise = register('newuser', 'password');
    expect(useAuthStore.getState().loading).toBe(true);

    await registerPromise;
    expect(useAuthStore.getState().loading).toBe(false);
  });
});
