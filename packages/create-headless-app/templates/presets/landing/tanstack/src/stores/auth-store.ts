import { create } from 'zustand'

type User = {
  id: string
  name: string
  email: string
}

type LoginCredentials = {
  email: string
  password: string
}

type RegisterData = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

type AuthState = {
  user: User | null
  expiresIn: number | null
  isHydrated: boolean
  isLoading: boolean
  error: string | null

  setUser: (user: User | null, expiresIn?: number | null) => void
  hydrate: (user: User | null, expiresIn?: number | null) => void
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  isAuthenticated: () => boolean
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    user: null,
    expiresIn: null,
    isHydrated: false,
    isLoading: false,
    error: null,

    setUser: (user, expiresIn) =>
      set((state) => ({
        user,
        expiresIn:
          expiresIn !== undefined ? expiresIn : user ? state.expiresIn : null,
      })),

    hydrate: (user, expiresIn) =>
      set((state) => ({
        user,
        isHydrated: true,
        expiresIn:
          expiresIn !== undefined ? expiresIn : user ? state.expiresIn : null,
      })),

    login: async (credentials) => {
      set({ error: null, isLoading: true })
      try {
        // TODO: Wire up to your auth backend API
        const response = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        })
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.message || 'Login failed')
        }
        const data = await response.json()
        set({
          user: data.user,
          expiresIn: data.expires_in ?? null,
          isLoading: false,
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Login failed'
        set({ error: message, isLoading: false })
        throw err
      }
    },

    register: async (data) => {
      set({ error: null, isLoading: true })
      try {
        // TODO: Wire up to your auth backend API
        const response = await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!response.ok) {
          const resData = await response.json().catch(() => ({}))
          throw new Error(resData.message || 'Registration failed')
        }
        const resData = await response.json()
        set({
          user: resData.user,
          expiresIn: resData.expires_in ?? null,
          isLoading: false,
        })
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Registration failed'
        set({ error: message, isLoading: false })
        throw err
      }
    },

    logout: async () => {
      set({ error: null, isLoading: true })
      try {
        // TODO: Wire up to your auth backend API
        await fetch('/api/v1/auth/logout', { method: 'POST' })
        set({ user: null, expiresIn: null, isLoading: false })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Logout failed'
        set({ error: message, user: null, expiresIn: null, isLoading: false })
      }
    },

    clearError: () => set({ error: null }),

    isAuthenticated: () => !!get().user,
  }),
)

export const useUser = () => useAuthStore((s) => s.user)
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated)
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user)
