import { createServerFn } from '@tanstack/react-start'
import type { Order, ShippingAddress } from '@/types/shop'
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

  if (json && typeof json === 'object' && 'success' in json) {
    return json.data as T
  }

  return json.data as T
}

export const getOrdersFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Order>> => {
    try {
      return await fetchFromApi<Array<Order>>('/api/v1/orders')
    } catch (error) {
      console.error('[Order Service] Failed to fetch orders:', error)
      return []
    }
  },
)

export const getOrderFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<Order | null> => {
    try {
      return await fetchFromApi<Order>(`/api/v1/orders/${data.id}`)
    } catch (error) {
      console.error('[Order Service] Failed to fetch order:', error)
      return null
    }
  })

export const createOrderFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { shippingAddress: ShippingAddress }) => data)
  .handler(async ({ data }): Promise<Order> => {
    return await fetchFromApi<Order>('/api/v1/orders', {
      method: 'POST',
      body: JSON.stringify({ shipping_address: data.shippingAddress }),
    })
  })
