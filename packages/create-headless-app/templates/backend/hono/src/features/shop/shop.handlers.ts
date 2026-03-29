/**
 * Shop handlers
 */

import type { Context } from 'hono';
import * as shopService from './shop.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';

/**
 * List products with filters and pagination
 */
export async function listProducts(c: Context) {
  const query = c.req.query();

  const filters = {
    category: query.category,
    search: query.search,
    sort: query.sort,
    min_price: query.min_price ? parseInt(query.min_price, 10) : undefined,
    max_price: query.max_price ? parseInt(query.max_price, 10) : undefined,
    page: query.page ? parseInt(query.page, 10) : 1,
    per_page: query.per_page ? parseInt(query.per_page, 10) : 12,
  };

  const result = await shopService.getProducts(filters);
  const { data, pagination } = result;

  return apiSuccess(c, data, {
    page: pagination.page,
    per_page: pagination.perPage,
    total: pagination.total,
    last_page: pagination.totalPages,
  });
}

/**
 * Get a single product by slug
 */
export async function getProduct(c: Context) {
  const slug = c.req.param('slug');
  const product = await shopService.getProductBySlug(slug);

  if (!product) {
    throw new AppError('Product not found', 'NOT_FOUND', 404);
  }

  return apiSuccess(c, product);
}

/**
 * List all categories
 */
export async function listCategories(c: Context) {
  const categories = await shopService.getCategories();
  return apiSuccess(c, categories);
}

/**
 * Get category with its products
 */
export async function getCategoryProducts(c: Context) {
  const slug = c.req.param('slug');
  const result = await shopService.getCategoryWithProducts(slug);

  if (!result) {
    throw new AppError('Category not found', 'NOT_FOUND', 404);
  }

  return apiSuccess(c, result);
}
