import { createServerFn } from '@tanstack/react-start'
import type {
  AdminDashboard,
  Category,
  Customer,
  InventoryItem,
  Order,
  OrderStatus,
  PaginatedResponse,
  Product,
  RevenueAnalytics,
  Review,
  ReviewStatus,
  Segment,
  TopProduct,
} from '@/types/shop'
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
    if (Array.isArray(json.data) && json.meta) {
      return { data: json.data, pagination: json.meta } as T
    }
    return json.data as T
  }

  return json.data as T
}

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const getAdminDashboardFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminDashboard> => {
    return await fetchFromApi<AdminDashboard>('/api/v1/admin/dashboard')
  },
)

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type AdminProductFilters = {
  search?: string
  page?: number
  perPage?: number
}

export const getAdminProductsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { filters?: AdminProductFilters }) => data)
  .handler(async ({ data }): Promise<PaginatedResponse<Product>> => {
    const params = new URLSearchParams()
    if (data.filters?.search) params.set('search', data.filters.search)
    if (data.filters?.page) params.set('page', String(data.filters.page))
    if (data.filters?.perPage) params.set('per_page', String(data.filters.perPage))
    const query = params.toString()
    return await fetchFromApi<PaginatedResponse<Product>>(
      `/api/v1/admin/products${query ? `?${query}` : ''}`,
    )
  })

export const createProductFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { product: Partial<Product> }) => data)
  .handler(async ({ data }): Promise<Product> => {
    return await fetchFromApi<Product>('/api/v1/admin/products', {
      method: 'POST',
      body: JSON.stringify(data.product),
    })
  })

export const updateProductFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; product: Partial<Product> }) => data)
  .handler(async ({ data }): Promise<Product> => {
    return await fetchFromApi<Product>(`/api/v1/admin/products/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data.product),
    })
  })

export const deleteProductFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(`/api/v1/admin/products/${data.id}`, {
      method: 'DELETE',
    })
  })

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type AdminOrderFilters = {
  status?: OrderStatus
  page?: number
  perPage?: number
}

export const getAdminOrdersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { filters?: AdminOrderFilters }) => data)
  .handler(async ({ data }): Promise<PaginatedResponse<Order>> => {
    const params = new URLSearchParams()
    if (data.filters?.status) params.set('status', data.filters.status)
    if (data.filters?.page) params.set('page', String(data.filters.page))
    if (data.filters?.perPage) params.set('per_page', String(data.filters.perPage))
    const query = params.toString()
    return await fetchFromApi<PaginatedResponse<Order>>(
      `/api/v1/admin/orders${query ? `?${query}` : ''}`,
    )
  })

export const updateOrderStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; status: OrderStatus }) => data)
  .handler(async ({ data }): Promise<Order> => {
    return await fetchFromApi<Order>(`/api/v1/admin/orders/${data.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: data.status }),
    })
  })

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type AdminCustomerFilters = {
  search?: string
  segment?: string
  page?: number
  perPage?: number
}

export const getAdminCustomersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { filters?: AdminCustomerFilters }) => data)
  .handler(async ({ data }): Promise<PaginatedResponse<Customer>> => {
    const params = new URLSearchParams()
    if (data.filters?.search) params.set('search', data.filters.search)
    if (data.filters?.segment) params.set('segment', data.filters.segment)
    if (data.filters?.page) params.set('page', String(data.filters.page))
    if (data.filters?.perPage) params.set('per_page', String(data.filters.perPage))
    const query = params.toString()
    return await fetchFromApi<PaginatedResponse<Customer>>(
      `/api/v1/admin/customers${query ? `?${query}` : ''}`,
    )
  })

export const createCustomerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { customer: Partial<Customer> }) => data)
  .handler(async ({ data }): Promise<Customer> => {
    return await fetchFromApi<Customer>('/api/v1/admin/customers', {
      method: 'POST',
      body: JSON.stringify(data.customer),
    })
  })

export const updateCustomerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; customer: Partial<Customer> }) => data)
  .handler(async ({ data }): Promise<Customer> => {
    return await fetchFromApi<Customer>(`/api/v1/admin/customers/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify(data.customer),
    })
  })

export const deleteCustomerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(`/api/v1/admin/customers/${data.id}`, {
      method: 'DELETE',
    })
  })

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export type AdminReviewFilters = {
  status?: ReviewStatus
  rating?: number
  page?: number
  perPage?: number
}

export const getAdminReviewsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { filters?: AdminReviewFilters }) => data)
  .handler(async ({ data }): Promise<PaginatedResponse<Review>> => {
    const params = new URLSearchParams()
    if (data.filters?.status) params.set('status', data.filters.status)
    if (data.filters?.rating) params.set('rating', String(data.filters.rating))
    if (data.filters?.page) params.set('page', String(data.filters.page))
    if (data.filters?.perPage) params.set('per_page', String(data.filters.perPage))
    const query = params.toString()
    return await fetchFromApi<PaginatedResponse<Review>>(
      `/api/v1/admin/reviews${query ? `?${query}` : ''}`,
    )
  })

export const moderateReviewFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string; status: ReviewStatus }) => data)
  .handler(async ({ data }): Promise<Review> => {
    return await fetchFromApi<Review>(`/api/v1/admin/reviews/${data.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: data.status }),
    })
  })

export const bulkApproveReviewsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { ids: Array<string> }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>('/api/v1/admin/reviews/bulk-approve', {
      method: 'POST',
      body: JSON.stringify({ ids: data.ids }),
    })
  })

export const bulkRejectReviewsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { ids: Array<string> }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>('/api/v1/admin/reviews/bulk-reject', {
      method: 'POST',
      body: JSON.stringify({ ids: data.ids }),
    })
  })

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export const getRevenueAnalyticsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<RevenueAnalytics> => {
    return await fetchFromApi<RevenueAnalytics>('/api/v1/admin/analytics/revenue')
  },
)

export const getTopProductsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<TopProduct>> => {
    return await fetchFromApi<Array<TopProduct>>('/api/v1/admin/analytics/top-products')
  },
)

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export const getAdminInventoryFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<InventoryItem>> => {
    return await fetchFromApi<Array<InventoryItem>>('/api/v1/admin/inventory')
  },
)

export const updateInventoryFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { productId: string; stockQuantity: number }) => data)
  .handler(async ({ data }): Promise<InventoryItem> => {
    return await fetchFromApi<InventoryItem>(
      `/api/v1/admin/inventory/${data.productId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ stockQuantity: data.stockQuantity }),
      },
    )
  })

// ---------------------------------------------------------------------------
// Categories (admin)
// ---------------------------------------------------------------------------

export const getAdminCategoriesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Category>> => {
    return await fetchFromApi<Array<Category>>('/api/v1/categories')
  },
)

// ---------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------

export const getSegmentsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Segment>> => {
    return await fetchFromApi<Array<Segment>>('/api/v1/admin/segments')
  },
)
