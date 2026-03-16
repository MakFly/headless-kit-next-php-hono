/**
 * Server Actions for Shop Admin
 *
 * All admin endpoints require authentication + admin role.
 */

'use server';

import {
  bffGet,
  bffPost,
  bffPut,
  bffPatch,
  bffDelete,
} from '../_shared/bff-client';
import { unwrapEnvelope, unwrapPaginated } from '../_shared/envelope';
import type {
  AdminDashboard,
  Product,
  Order,
  OrderStatus,
  Customer,
  Review,
  ReviewStatus,
  Category,
  RevenueAnalytics,
  TopProduct,
  InventoryItem,
  PaginatedResponse,
} from '@/types/shop';

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export async function getAdminDashboardAction(): Promise<AdminDashboard> {
  const response = await bffGet<unknown>('/api/v1/admin/dashboard');
  return unwrapEnvelope<AdminDashboard>(response);
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export type AdminProductFilters = {
  search?: string;
  page?: number;
  perPage?: number;
};

export async function getAdminProductsAction(
  filters?: AdminProductFilters
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.perPage) params.set('per_page', String(filters.perPage));

  const query = params.toString();
  const endpoint = `/api/v1/admin/products${query ? `?${query}` : ''}`;
  const response = await bffGet<unknown>(endpoint);
  return unwrapPaginated<Product>(response) as PaginatedResponse<Product>;
}

export async function createProductAction(
  data: Partial<Product>
): Promise<Product> {
  const response = await bffPost<unknown>('/api/v1/admin/products', data);
  return unwrapEnvelope<Product>(response);
}

export async function updateProductAction(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  const response = await bffPut<unknown>(`/api/v1/admin/products/${id}`, data);
  return unwrapEnvelope<Product>(response);
}

export async function deleteProductAction(id: string): Promise<void> {
  await bffDelete(`/api/v1/admin/products/${id}`);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type AdminOrderFilters = {
  status?: OrderStatus;
  page?: number;
  perPage?: number;
};

export async function getAdminOrdersAction(
  filters?: AdminOrderFilters
): Promise<PaginatedResponse<Order>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.perPage) params.set('per_page', String(filters.perPage));

  const query = params.toString();
  const endpoint = `/api/v1/admin/orders${query ? `?${query}` : ''}`;
  const response = await bffGet<unknown>(endpoint);
  return unwrapPaginated<Order>(response) as PaginatedResponse<Order>;
}

export async function updateOrderStatusAction(
  id: string,
  status: OrderStatus
): Promise<Order> {
  const response = await bffPatch<unknown>(
    `/api/v1/admin/orders/${id}/status`,
    { status }
  );
  return unwrapEnvelope<Order>(response);
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------

export type AdminCustomerFilters = {
  search?: string;
  segment?: string;
  page?: number;
  perPage?: number;
};

export async function getAdminCustomersAction(
  filters?: AdminCustomerFilters
): Promise<PaginatedResponse<Customer>> {
  const params = new URLSearchParams();
  if (filters?.search) params.set('search', filters.search);
  if (filters?.segment) params.set('segment', filters.segment);
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.perPage) params.set('per_page', String(filters.perPage));

  const query = params.toString();
  const endpoint = `/api/v1/admin/customers${query ? `?${query}` : ''}`;
  const response = await bffGet<unknown>(endpoint);
  return unwrapPaginated<Customer>(response) as PaginatedResponse<Customer>;
}

export async function createCustomerAction(
  data: Partial<Customer>
): Promise<Customer> {
  const response = await bffPost<unknown>('/api/v1/admin/customers', data);
  return unwrapEnvelope<Customer>(response);
}

export async function updateCustomerAction(
  id: string,
  data: Partial<Customer>
): Promise<Customer> {
  const response = await bffPut<unknown>(`/api/v1/admin/customers/${id}`, data);
  return unwrapEnvelope<Customer>(response);
}

export async function deleteCustomerAction(id: string): Promise<void> {
  await bffDelete(`/api/v1/admin/customers/${id}`);
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export type AdminReviewFilters = {
  status?: ReviewStatus;
  rating?: number;
  page?: number;
  perPage?: number;
};

export async function getAdminReviewsAction(
  filters?: AdminReviewFilters
): Promise<PaginatedResponse<Review>> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.rating) params.set('rating', String(filters.rating));
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.perPage) params.set('per_page', String(filters.perPage));

  const query = params.toString();
  const endpoint = `/api/v1/admin/reviews${query ? `?${query}` : ''}`;
  const response = await bffGet<unknown>(endpoint);
  return unwrapPaginated<Review>(response) as PaginatedResponse<Review>;
}

export async function moderateReviewAction(
  id: string,
  data: { status: ReviewStatus }
): Promise<Review> {
  const response = await bffPut<unknown>(`/api/v1/admin/reviews/${id}`, data);
  return unwrapEnvelope<Review>(response);
}

export async function bulkApproveReviewsAction(
  ids: string[]
): Promise<void> {
  await bffPost('/api/v1/admin/reviews/bulk-approve', { ids });
}

export async function bulkRejectReviewsAction(
  ids: string[]
): Promise<void> {
  await bffPost('/api/v1/admin/reviews/bulk-reject', { ids });
}

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

export async function getRevenueAnalyticsAction(): Promise<RevenueAnalytics> {
  const response = await bffGet<unknown>('/api/v1/admin/analytics/revenue');
  return unwrapEnvelope<RevenueAnalytics>(response);
}

export async function getTopProductsAction(): Promise<TopProduct[]> {
  const response = await bffGet<unknown>('/api/v1/admin/analytics/top-products');
  return unwrapEnvelope<TopProduct[]>(response);
}

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------

export async function getAdminInventoryAction(): Promise<InventoryItem[]> {
  const response = await bffGet<unknown>('/api/v1/admin/inventory');
  return unwrapEnvelope<InventoryItem[]>(response);
}

export async function updateInventoryAction(
  productId: string,
  stockQuantity: number
): Promise<InventoryItem> {
  const response = await bffPatch<unknown>(
    `/api/v1/admin/inventory/${productId}`,
    { stockQuantity }
  );
  return unwrapEnvelope<InventoryItem>(response);
}

// ---------------------------------------------------------------------------
// Categories (admin)
// ---------------------------------------------------------------------------

export async function getAdminCategoriesAction(): Promise<Category[]> {
  const response = await bffGet<unknown>('/api/v1/categories');
  return unwrapEnvelope<Category[]>(response);
}

// ---------------------------------------------------------------------------
// Segments
// ---------------------------------------------------------------------------

export type Segment = {
  id: string;
  name: string;
  slug: string;
  customerCount: number;
};

export async function getSegmentsAction(): Promise<Segment[]> {
  const response = await bffGet<unknown>('/api/v1/admin/segments');
  return unwrapEnvelope<Segment[]>(response);
}
