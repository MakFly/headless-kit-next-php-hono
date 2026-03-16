import type { AuthResponse, NormalizedUser, TokenStorage } from '../types'

type SymfonyUser = {
  id: string
  email: string
  name?: string
  username?: string
  email_verified_at?: string | null
  emailVerified?: boolean
  emailVerifiedAt?: string | null
  avatar_url?: string | null
  avatar?: string | null
  created_at?: string
  createdAt?: string
  updated_at?: string
  updatedAt?: string
  roles?: Array<string>
}

type SymfonyAuthResponse = {
  user: SymfonyUser
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type?: string
}

export function transformUser(symfonyUser: SymfonyUser): NormalizedUser {
  const roles = symfonyUser.roles?.map((role, index) => ({
    id: index + 1,
    name: String(role).replace('ROLE_', '').toLowerCase(),
    slug: String(role).replace('ROLE_', '').toLowerCase(),
  }))
  return {
    id: symfonyUser.id,
    email: symfonyUser.email,
    name: symfonyUser.name ?? symfonyUser.username ?? symfonyUser.email ?? '',
    email_verified_at: symfonyUser.email_verified_at ?? symfonyUser.emailVerifiedAt ?? null,
    avatar_url: symfonyUser.avatar_url ?? symfonyUser.avatar ?? null,
    created_at: symfonyUser.created_at ?? symfonyUser.createdAt,
    updated_at: symfonyUser.updated_at ?? symfonyUser.updatedAt,
    roles,
    permissions: [],
  }
}

export function transformAuthResponse(
  response: SymfonyAuthResponse | { success: boolean; data: SymfonyAuthResponse },
): AuthResponse {
  const payload: SymfonyAuthResponse =
    'success' in response &&
    response.data &&
    typeof response.data === 'object' &&
    'access_token' in (response.data as Record<string, unknown>)
      ? (response as { data: SymfonyAuthResponse }).data
      : (response as SymfonyAuthResponse)

  const tokens: TokenStorage = {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    token_type: payload.token_type || 'Bearer',
    expires_in: payload.expires_in,
  }
  return { user: transformUser(payload.user), tokens }
}

export type SymfonyMeResponse = SymfonyUser | { user: SymfonyUser; expiresAt?: string }

export function transformMeResponse(
  response: SymfonyMeResponse | { success: boolean; data: SymfonyMeResponse },
): NormalizedUser {
  let inner: SymfonyMeResponse = response as SymfonyMeResponse
  if ('success' in response && 'data' in response) {
    inner = (response as { data: SymfonyMeResponse }).data
  }
  const user = 'user' in inner ? (inner as { user: SymfonyUser }).user : (inner)
  return transformUser(user)
}

export function transformOAuthProviders(response: { providers: Array<string> } | Array<string>): Array<string> {
  if (Array.isArray(response)) return response
  return response.providers
}

export function transformOAuthRedirect(response: { url: string } | { redirect_url: string }): string {
  if ('url' in response) return response.url
  return response.redirect_url
}
