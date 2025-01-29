import { create } from 'zustand';

interface User {
  id: string;
  username: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  login: async (username: string, password: string) => {
    set({ loading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ user: { id: '1', username }, loading: false });
    } catch (error) {
      set({ loading: false });
      throw new Error('Login failed');
    }
  },

  register: async (username: string, password: string) => {
    set({ loading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ user: { id: '1', username }, loading: false });
    } catch (error) {
      set({ loading: false });
      throw new Error('Registration failed');
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ user: null, loading: false });
    } catch (error) {
      set({ loading: false });
      throw new Error('Logout failed');
    }
  },
}));
