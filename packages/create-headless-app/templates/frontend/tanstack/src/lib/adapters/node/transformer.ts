import type { NormalizedUser, TokenStorage, AuthResponse } from '../types'

type NodeUser = {
  id: string
  email: string
  name: string
  emailVerifiedAt?: string | null
  email_verified_at?: string | null
  avatarUrl?: string | null
  avatar_url?: string | null
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  roles?: Array<string | { id: number; name: string; slug: string }>
  permissions?: Array<string | { id: number; name: string; slug: string; resource: string; action: string }>
}

type NodeAuthResponse = {
  user: NodeUser
  accessToken?: string
  access_token?: string
  refreshToken?: string
  refresh_token?: string
  expiresIn?: number
  expires_in?: number
  tokenType?: string
  token_type?: string
}

export function transformUser(nodeUser: NodeUser): NormalizedUser {
  const roles = nodeUser.roles?.map((role, index) => {
    if (typeof role === 'string') return { id: index + 1, name: role.replace('ROLE_', '').toLowerCase(), slug: role.replace('ROLE_', '').toLowerCase() }
    return role
  })
  const permissions = nodeUser.permissions?.map((perm, index) => {
    if (typeof perm === 'string') {
      const [resource, action] = perm.split(':')
      return { id: index + 1, name: perm, slug: perm, resource: resource || perm, action: action || 'read' }
    }
    return perm
  })
  return {
    id: nodeUser.id,
    email: nodeUser.email,
    name: nodeUser.name,
    email_verified_at: nodeUser.emailVerifiedAt ?? nodeUser.email_verified_at ?? null,
    avatar_url: nodeUser.avatarUrl ?? nodeUser.avatar_url ?? null,
    created_at: nodeUser.createdAt ?? nodeUser.created_at,
    updated_at: nodeUser.updatedAt ?? nodeUser.updated_at,
    roles,
    permissions,
  }
}

export function transformAuthResponse(response: NodeAuthResponse): AuthResponse {
  const tokens: TokenStorage = {
    access_token: response.accessToken || response.access_token || '',
    refresh_token: response.refreshToken || response.refresh_token,
    token_type: response.tokenType || response.token_type || 'Bearer',
    expires_in: response.expiresIn || response.expires_in,
  }
  return { user: transformUser(response.user), tokens }
}

export function transformMeResponse(response: NodeUser | { user: NodeUser }): NormalizedUser {
  const user = 'user' in response && response.user ? response.user : (response as NodeUser)
  return transformUser(user)
}

export function transformOAuthProviders(response: { providers: string[] } | string[] | { data: string[] }): string[] {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.providers
}

export function transformOAuthRedirect(response: { url: string } | { redirectUrl: string } | { redirect_url: string }): string {
  if ('url' in response) return response.url
  if ('redirectUrl' in response) return response.redirectUrl
  return response.redirect_url
}
