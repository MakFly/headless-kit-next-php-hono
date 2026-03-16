export type User = {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  avatar_url?: string
  created_at: string
  updated_at: string
  roles: Array<Role>
  permissions: Array<Permission>
}

export type Role = {
  id: number
  name: string
  slug: string
  description?: string
  permissions?: Array<Permission>
  created_at: string
  updated_at: string
}

export type Permission = {
  id: number
  name: string
  slug: string
  resource: string
  action: PermissionAction
  created_at: string
  updated_at: string
}

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage'

export type RoleSlug = 'admin' | 'moderator' | 'user'

export type OAuthProvider = 'google' | 'github'

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterData = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type AuthTokens = {
  access_token: string
  token_type: 'Bearer'
  expires_in: number
  refresh_token?: string
}

export type ApiResponse<T = unknown> = {
  data: T
  message?: string
  errors?: Record<string, Array<string>>
}

export function hasPermission(
  user: User,
  resource: string,
  action: PermissionAction,
): boolean {
  return user.permissions.some(
    (p) => p.resource === resource && (p.action === action || p.action === 'manage'),
  )
}

export function hasRole(user: User, roleSlug: RoleSlug): boolean {
  return user.roles.some((r) => r.slug === roleSlug)
}

export function isAdmin(user: User): boolean {
  return hasRole(user, 'admin')
}
