import { createServerFn } from '@tanstack/react-start'
import { getAuthAdapter, getBackendType, getAdapterConfig } from '@/lib/adapters'
import type { Permission, Role, User } from './rbac-types'

export type { Permission, Role, User } from './rbac-types'

function getApiBaseUrl(): string {
  const backend = getBackendType()
  const config = getAdapterConfig(backend)
  const fallback = process.env.LARAVEL_API_URL || 'http://localhost:8000'
  return (config.baseUrl || fallback).replace(/\/$/, '')
}

async function fetchFromApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const adapter = getAuthAdapter()
  const baseUrl = getApiBaseUrl()

  const executeRequest = async (accessToken: string | null): Promise<Response> =>
    fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    })

  let token = await adapter.getAccessToken()
  let response = await executeRequest(token)

  if (response.status === 401) {
    try {
      const refreshed = await adapter.refresh()
      token = refreshed.tokens.access_token
      response = await executeRequest(token)
    } catch {
      await adapter.clearTokens()
    }
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  const data = await response.json()
  return data.data as T
}

export const getRolesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Role[]> => {
    try {
      return await fetchFromApi<Role[]>('/api/v1/roles')
    } catch (error) {
      console.error('[RBAC Service] Failed to fetch roles:', error)
      return []
    }
  },
)

export const getPermissionsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Permission[]> => {
    try {
      return await fetchFromApi<Permission[]>('/api/v1/permissions')
    } catch (error) {
      console.error('[RBAC Service] Failed to fetch permissions:', error)
      return []
    }
  },
)

export const getUsersFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<User[]> => {
    try {
      return await fetchFromApi<User[]>('/api/v1/users')
    } catch (error) {
      console.error('[RBAC Service] Failed to fetch users:', error)
      return []
    }
  },
)

export const getUserByIdFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }): Promise<User | null> => {
    try {
      return await fetchFromApi<User>(`/api/v1/users/${data.id}`)
    } catch (error) {
      console.error('[RBAC Service] Failed to fetch user:', error)
      return null
    }
  })

export const updateUserRolesFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: number; roleIds: number[] }) => data)
  .handler(async ({ data }): Promise<User | null> => {
    try {
      return await fetchFromApi<User>(`/api/v1/users/${data.userId}/roles`, {
        method: 'PUT',
        body: JSON.stringify({ role_ids: data.roleIds }),
      })
    } catch (error) {
      console.error('[RBAC Service] Failed to update user roles:', error)
      return null
    }
  })

export const createRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      slug: string
      description?: string
      permissionIds: number[]
    }) => data,
  )
  .handler(async ({ data }): Promise<Role | null> => {
    try {
      return await fetchFromApi<Role>('/api/v1/roles', {
        method: 'POST',
        body: JSON.stringify({
          name: data.name,
          slug: data.slug,
          description: data.description,
          permission_ids: data.permissionIds,
        }),
      })
    } catch (error) {
      console.error('[RBAC Service] Failed to create role:', error)
      return null
    }
  })

export const updateRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      roleId: number
      name?: string
      description?: string
      permissionIds?: number[]
    }) => data,
  )
  .handler(async ({ data }): Promise<Role | null> => {
    try {
      return await fetchFromApi<Role>(`/api/v1/roles/${data.roleId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          permission_ids: data.permissionIds,
        }),
      })
    } catch (error) {
      console.error('[RBAC Service] Failed to update role:', error)
      return null
    }
  })

export const deleteRoleFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { roleId: number }) => data)
  .handler(async ({ data }): Promise<boolean> => {
    try {
      await fetchFromApi<void>(`/api/v1/roles/${data.roleId}`, {
        method: 'DELETE',
      })
      return true
    } catch (error) {
      console.error('[RBAC Service] Failed to delete role:', error)
      return false
    }
  })
