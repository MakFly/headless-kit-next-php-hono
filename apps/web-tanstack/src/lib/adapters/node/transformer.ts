import type { AuthResponse, NormalizedUser, TokenStorage } from '../types'

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

export function transformAuthResponse(
  response: NodeAuthResponse | { success: boolean; data: NodeAuthResponse },
): AuthResponse {
  const payload: NodeAuthResponse =
    'success' in response &&
    response.data &&
    typeof response.data === 'object' &&
    ('accessToken' in (response.data as Record<string, unknown>) ||
      'access_token' in (response.data as Record<string, unknown>))
      ? (response as { data: NodeAuthResponse }).data
      : (response as NodeAuthResponse)

  const tokens: TokenStorage = {
    access_token: payload.accessToken || payload.access_token || '',
    refresh_token: payload.refreshToken || payload.refresh_token,
    token_type: payload.tokenType || payload.token_type || 'Bearer',
    expires_in: payload.expiresIn || payload.expires_in,
  }
  return { user: transformUser(payload.user), tokens }
}

export function transformMeResponse(
  response: NodeUser | { user: NodeUser } | { success: boolean; data: NodeUser | { user: NodeUser } },
): NormalizedUser {
  let inner: NodeUser | { user: NodeUser } = response as NodeUser | { user: NodeUser }
  if ('success' in response && 'data' in response) {
    inner = (response as { data: NodeUser | { user: NodeUser } }).data
  }
  const user =
    'user' in inner && (inner as { user: NodeUser }).user
      ? (inner as { user: NodeUser }).user
      : (inner as NodeUser)
  return transformUser(user)
}

export function transformOAuthProviders(response: { providers: Array<string> } | Array<string> | { data: Array<string> }): Array<string> {
  if (Array.isArray(response)) return response
  if ('data' in response) return response.data
  return response.providers
}

export function transformOAuthRedirect(response: { url: string } | { redirectUrl: string } | { redirect_url: string }): string {
  if ('url' in response) return response.url
  if ('redirectUrl' in response) return response.redirectUrl
  return response.redirect_url
}
