import { createServerFn } from '@tanstack/react-start'
import type { Category, PaginatedResponse, Product } from '@/types/shop'
import { getAdapterConfig, getAuthAdapter, getBackendType } from '@/lib/adapters'

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

  const json = await response.json()

  // Handle envelope format: { success, data, meta?, status, request_id }
  if (json && typeof json === 'object' && 'success' in json) {
    // For paginated responses, reconstruct { data, pagination } shape from meta
    if (Array.isArray(json.data) && json.meta) {
      return { data: json.data, pagination: json.meta } as T
    }
    return json.data as T
  }

  // Legacy format: { data: ... }
  return json.data as T
}

export const getProductsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { filters?: Record<string, string> }) => data)
  .handler(async ({ data }): Promise<PaginatedResponse<Product>> => {
    try {
      const params = new URLSearchParams(data.filters)
      return await fetchFromApi<PaginatedResponse<Product>>(
        `/api/v1/products?${params}`,
      )
    } catch (error) {
      console.error('[Shop Service] Failed to fetch products:', error)
      return { data: [], pagination: { page: 1, perPage: 12, total: 0, totalPages: 0 } }
    }
  })

export const getProductBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<Product | null> => {
    try {
      return await fetchFromApi<Product>(`/api/v1/products/${data.slug}`)
    } catch (error) {
      console.error('[Shop Service] Failed to fetch product:', error)
      return null
    }
  })

export const getCategoriesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Category>> => {
    try {
      return await fetchFromApi<Array<Category>>('/api/v1/categories')
    } catch (error) {
      console.error('[Shop Service] Failed to fetch categories:', error)
      return []
    }
  },
)

export const getCategoryBySlugFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<Category | null> => {
    try {
      return await fetchFromApi<Category>(`/api/v1/categories/${data.slug}`)
    } catch (error) {
      console.error('[Shop Service] Failed to fetch category:', error)
      return null
    }
  })
