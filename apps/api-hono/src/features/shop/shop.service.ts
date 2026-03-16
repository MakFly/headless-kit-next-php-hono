/**
 * Shop service
 */

import * as shopRepository from './shop.repository.ts';
import type { ProductFilters } from './shop.repository.ts';

/**
 * Get products with filters and pagination
 */
export async function getProducts(filters: ProductFilters = {}) {
  const [data, total] = await Promise.all([
    shopRepository.findAllProducts(filters),
    shopRepository.countProducts(filters),
  ]);

  const page = filters.page || 1;
  const perPage = filters.per_page || 12;

  return {
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string) {
  return shopRepository.findProductBySlug(slug);
}

/**
 * Get all categories with product counts
 */
export async function getCategories() {
  return shopRepository.findAllCategories();
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string) {
  return shopRepository.findCategoryBySlug(slug);
}

/**
 * Get category with its products
 */
export async function getCategoryWithProducts(slug: string) {
  const category = await shopRepository.findCategoryBySlug(slug);
  if (!category) return null;

  const products = await shopRepository.findAllProducts({ category: slug });

  return {
    ...category,
    products,
  };
}
