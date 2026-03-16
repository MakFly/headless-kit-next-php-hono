import { create } from 'zustand';

type User = {
  id: string | number;
  email: string;
  name: string;
  email_verified_at?: string | null;
  avatar_url?: string | null;
  roles?: Array<{ id: number; name: string; slug: string }>;
  permissions?: Array<{ id: number; name: string; slug: string; resource: string; action: string }>;
};

type AuthState = {
  user: User | null;
  isHydrated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  hydrate: (user: User | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // Computed
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isHydrated: false,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user }),

  hydrate: (user) => set({ user, isHydrated: true }),

  login: async (credentials) => {
    set({ error: null, isLoading: true });
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Login failed');
      }

      const data = await res.json();
      const user = data.user || data.data?.user;
      set({ user, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ error: null, isLoading: true });
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const responseData = await res.json().catch(() => ({}));
        throw new Error(responseData.message || 'Registration failed');
      }

      const responseData = await res.json();
      const user = responseData.user || responseData.data?.user;
      set({ user, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ error: null, isLoading: true });
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      set({ user: null, isLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Logout failed';
      set({ error: message, user: null, isLoading: false });
    }
  },

  refreshUser: async () => {
    set({ error: null });
    try {
      const res = await fetch('/api/v1/auth/me');
      if (!res.ok) throw new Error('Not authenticated');
      const data = await res.json();
      const user = data.user || data.data?.user || data;
      set({ user });
    } catch (err) {
      set({ user: null });
      const message = err instanceof Error ? err.message : 'Failed to refresh user';
      set({ error: message });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().user,
}));

// Selector hooks for convenience
export const useUser = () => useAuthStore((s) => s.user);
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated);
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user);
