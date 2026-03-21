import { createServerFn } from '@tanstack/react-start'
import type { Cart } from '@/types/shop'
import { getAdapterConfig, getAuthAdapter, getBackendType } from '@/lib/adapters'

function getApiBaseUrl(): string {
  const backend = getBackendType()
  const config = getAdapterConfig(backend)
  const fallback = process.env.LARAVEL_API_URL || 'http://localhost:8002'
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

  if (json && typeof json === 'object' && 'success' in json) {
    return json.data as T
  }

  return json.data as T
}

export const getCartFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Cart> => {
    try {
      return await fetchFromApi<Cart>('/api/v1/cart')
    } catch (error) {
      console.error('[Cart Service] Failed to fetch cart:', error)
      return { id: '', userId: '', items: [], total: 0 }
    }
  },
)

export const addToCartFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { productId: string; quantity?: number }) => data)
  .handler(async ({ data }): Promise<Cart> => {
    return await fetchFromApi<Cart>('/api/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: data.productId, quantity: data.quantity ?? 1 }),
    })
  })

export const updateCartItemFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { itemId: string; quantity: number }) => data)
  .handler(async ({ data }): Promise<Cart> => {
    return await fetchFromApi<Cart>(`/api/v1/cart/items/${data.itemId}`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity: data.quantity }),
    })
  })

export const removeCartItemFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { itemId: string }) => data)
  .handler(async ({ data }): Promise<Cart> => {
    return await fetchFromApi<Cart>(`/api/v1/cart/items/${data.itemId}`, {
      method: 'DELETE',
    })
  })
