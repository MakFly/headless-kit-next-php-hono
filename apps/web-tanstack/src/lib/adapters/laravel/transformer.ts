import type { NormalizedUser, TokenStorage, AuthResponse } from '../types'

type LaravelUser = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  avatar_url?: string
  created_at: string
  updated_at: string
  roles?: Array<{
    id: number
    name: string
    slug: string
    description?: string
    permissions?: Array<{
      id: number
      name: string
      slug: string
      resource: string
      action: string
    }>
    created_at: string
    updated_at: string
  }>
  permissions?: Array<{
    id: number
    name: string
    slug: string
    resource: string
    action: string
    created_at: string
    updated_at: string
  }>
}

type LaravelAuthResponse = {
  data: {
    user: LaravelUser
    access_token: string
    refresh_token?: string
    token_type?: string
    expires_in?: number
  }
  message?: string
}

type LaravelMeResponse = {
  data: LaravelUser
}

export function transformUser(laravelUser: LaravelUser): NormalizedUser {
  return {
    id: laravelUser.id,
    email: laravelUser.email,
    name: laravelUser.name,
    email_verified_at: laravelUser.email_verified_at,
    avatar_url: laravelUser.avatar_url ?? null,
    created_at: laravelUser.created_at,
    updated_at: laravelUser.updated_at,
    roles: laravelUser.roles?.map(r => ({ id: r.id, name: r.name, slug: r.slug })),
    permissions: laravelUser.permissions?.map(p => ({
      id: p.id, name: p.name, slug: p.slug, resource: p.resource, action: p.action,
    })),
  }
}

export function transformAuthResponse(response: LaravelAuthResponse): AuthResponse {
  const tokens: TokenStorage = {
    access_token: response.data.access_token,
    refresh_token: response.data.refresh_token,
    token_type: response.data.token_type || 'Bearer',
    expires_in: response.data.expires_in,
  }
  return { user: transformUser(response.data.user), tokens }
}

export function transformMeResponse(response: LaravelMeResponse): NormalizedUser {
  return transformUser(response.data)
}

export function transformOAuthProviders(response: { data: string[] }): string[] {
  return response.data
}

export function transformOAuthRedirect(response: { data: { redirect_url: string } }): string {
  return response.data.redirect_url
}
