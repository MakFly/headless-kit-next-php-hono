import { create } from 'zustand'
import type { LoginCredentials, OAuthProvider, PermissionAction, RegisterData, RoleSlug, User  } from '@/types'
import {
  hasPermission as checkHasPermission,
  hasRole as checkHasRole,
  isAdmin as checkIsAdmin,
} from '@/types'
import {
  getCurrentUserFn,
  getOAuthUrlFn,
  loginFn,
  logoutFn,
  registerFn,
} from '@/lib/server/auth'
import {
  verify2faFn,
  verify2faRecoveryFn,
} from '@/lib/server/two-factor'
import { COOKIE_NAMES } from '@/lib/config/env'

const getStoredExpiresAt = (): number | null => {
  if (typeof document === 'undefined') return null
  const name = COOKIE_NAMES.TOKEN_EXPIRES_AT + '='
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const trimmed = cookie.trim()
    if (trimmed.startsWith(name)) {
      const isoValue = decodeURIComponent(trimmed.substring(name.length))
      const ms = new Date(isoValue).getTime()
      return isNaN(ms) ? null : ms
    }
  }
  return null
}

type AuthState = {
  user: User | null
  expiresIn: number | null
  isHydrated: boolean
  isLoading: boolean
  error: string | null
  requires2fa: boolean

  setUser: (user: User | null, expiresIn?: number | null) => void
  hydrate: (user: User | null, expiresIn?: number | null) => void
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>
  verify2fa: (code: string) => Promise<void>
  verify2faRecovery: (code: string) => Promise<void>
  clearError: () => void

  isAuthenticated: () => boolean
  hasPermission: (resource: string, action: PermissionAction) => boolean
  hasRole: (roleSlug: RoleSlug) => boolean
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
      user: null,
      expiresIn: null,
      isHydrated: false,
      isLoading: false,
      error: null,
      requires2fa: false,

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
        set({ error: null, isLoading: true, requires2fa: false })
        try {
          const response = await loginFn({ data: credentials })
          if ('requires2fa' in response && response.requires2fa) {
            set({ requires2fa: true, isLoading: false })
            return
          }
          set({
            user: response.user,
            expiresIn: response.expiresIn,
            isLoading: false,
            requires2fa: false,
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
          const response = await registerFn({ data })
          set({
            user: response.user,
            expiresIn: response.expiresIn,
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
          await logoutFn()
          set({ user: null, expiresIn: null, isLoading: false, requires2fa: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Logout failed'
          set({ error: message, user: null, expiresIn: null, isLoading: false })
        }
      },

      refreshUser: async () => {
        set({ error: null })
        try {
          const result = await getCurrentUserFn()
          if (result) {
            set({ user: result.user, expiresIn: result.expiresIn })
          } else {
            set({ user: null, expiresIn: null })
          }
        } catch (err) {
          set({ user: null, expiresIn: null })
          const message =
            err instanceof Error ? err.message : 'Failed to refresh user'
          set({ error: message })
          throw err
        }
      },

      loginWithOAuth: async (provider) => {
        try {
          const { url } = await getOAuthUrlFn({ data: { provider } })
          window.location.href = url
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'OAuth redirect failed'
          set({ error: message })
          throw err
        }
      },

      verify2fa: async (code) => {
        set({ error: null, isLoading: true })
        try {
          const response = await verify2faFn({ data: { code } })
          set({
            user: response.user,
            expiresIn: response.expiresIn,
            isLoading: false,
            requires2fa: false,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : '2FA verification failed'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      verify2faRecovery: async (code) => {
        set({ error: null, isLoading: true })
        try {
          const response = await verify2faRecoveryFn({ data: { code } })
          set({
            user: response.user,
            expiresIn: response.expiresIn,
            isLoading: false,
            requires2fa: false,
          })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Recovery verification failed'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      clearError: () => set({ error: null }),

      isAuthenticated: () => !!get().user,

      hasPermission: (resource, action) => {
        const { user } = get()
        if (!user) return false
        return checkHasPermission(user, resource, action)
      },

      hasRole: (roleSlug) => {
        const { user } = get()
        if (!user) return false
        return checkHasRole(user, roleSlug)
      },

      isAdmin: () => {
        const { user } = get()
        if (!user) return false
        return checkIsAdmin(user)
      },
  }),
)

export const useUser = () => useAuthStore((s) => s.user)
export const useIsHydrated = () => useAuthStore((s) => s.isHydrated)
export const useIsAuthenticated = () => useAuthStore((s) => !!s.user)
export { getStoredExpiresAt }
