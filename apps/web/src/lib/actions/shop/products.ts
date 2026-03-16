'use server';

import { bffGet } from '../_shared/bff-client';
import { unwrapEnvelope, unwrapPaginated } from '../_shared/envelope';
import type { Product, ProductFilters, PaginatedResponse, Category } from '@/types/shop';

export async function getProductsAction(filters?: ProductFilters): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.sort) params.set('sort', filters.sort);
  if (filters?.minPrice) params.set('min_price', String(filters.minPrice));
  if (filters?.maxPrice) params.set('max_price', String(filters.maxPrice));
  if (filters?.page) params.set('page', String(filters.page));
  if (filters?.perPage) params.set('per_page', String(filters.perPage));

  const query = params.toString();
  const endpoint = `/api/v1/products${query ? `?${query}` : ''}`;

  const response = await bffGet<unknown>(endpoint, { skipAuth: true });
  return unwrapPaginated<Product>(response) as PaginatedResponse<Product>;
}

export async function getProductBySlugAction(slug: string): Promise<Product> {
  const response = await bffGet<unknown>(`/api/v1/products/${slug}`, { skipAuth: true });
  return unwrapEnvelope<Product>(response);
}

export async function getCategoriesAction(): Promise<Category[]> {
  const response = await bffGet<unknown>('/api/v1/categories', { skipAuth: true });
  return unwrapEnvelope<Category[]>(response);
}

export async function getCategoryBySlugAction(slug: string): Promise<Category & { products: Product[] }> {
  type Result = Category & { products: Product[] };
  const response = await bffGet<unknown>(`/api/v1/categories/${slug}`, { skipAuth: true });
  return unwrapEnvelope<Result>(response);
}
