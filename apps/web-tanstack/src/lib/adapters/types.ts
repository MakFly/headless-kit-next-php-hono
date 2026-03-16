import type { User } from '@/types'

export type BackendType = 'laravel' | 'symfony' | 'node'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
  password_confirmation?: string
}

export type RefreshTokenRequest = {
  refresh_token?: string
}

export type NormalizedUser = {
  id: string | number
  email: string
  name: string
  email_verified_at?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
  roles?: Array<{
    id: number
    name: string
    slug: string
  }>
  permissions?: Array<{
    id: number
    name: string
    slug: string
    resource: string
    action: string
  }>
}

export type TokenStorage = {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export type AuthResponse = {
  user: NormalizedUser
  tokens: TokenStorage
}

export type AdapterConfig = {
  baseUrl: string
  timeout?: number
  authPrefix?: string
}

export type AuthAdapter = {
  login: (credentials: LoginRequest) => Promise<AuthResponse>
  register: (data: RegisterRequest) => Promise<AuthResponse>
  logout: () => Promise<void>
  refresh: (request?: RefreshTokenRequest) => Promise<AuthResponse>
  getUser: () => Promise<NormalizedUser | null>
  getOAuthProviders: () => Promise<Array<string>>
  getOAuthUrl: (provider: string) => Promise<string>
  storeTokens: (tokens: TokenStorage) => Promise<void>
  clearTokens: () => Promise<void>
  getAccessToken: () => Promise<string | null>
}

export function toUser(normalized: NormalizedUser): User {
  return {
    id: typeof normalized.id === 'string' ? parseInt(normalized.id, 10) : normalized.id,
    name: normalized.name,
    email: normalized.email,
    email_verified_at: normalized.email_verified_at ?? null,
    avatar_url: normalized.avatar_url ?? undefined,
    created_at: normalized.created_at ?? new Date().toISOString(),
    updated_at: normalized.updated_at ?? new Date().toISOString(),
    roles: (normalized.roles ?? []).map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    permissions: (normalized.permissions ?? []).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      resource: p.resource,
      action: p.action as 'create' | 'read' | 'update' | 'delete' | 'manage',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  }
}
