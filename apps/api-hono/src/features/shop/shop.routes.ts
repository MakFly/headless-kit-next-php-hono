/**
 * Shop routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import * as shopHandlers from './shop.handlers.ts';
import { createProductSchema } from './shop.schemas.ts';
import { authMiddleware } from '../../shared/middleware/index.ts';
import { apiError } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const shop = new Hono<{ Variables: AppVariables }>();

/**
 * GET /api/v1/products
 * List products with optional filters
 */
shop.get('/products', async (c) => {
  return shopHandlers.listProducts(c);
});

/**
 * POST /api/v1/products
 * Create a new product (authenticated)
 */
shop.post(
  '/products',
  authMiddleware,
  zValidator('json', createProductSchema, (result, c) => {
    if (!result.success) {
      return apiError(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        400,
        result.error.flatten().fieldErrors
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return shopHandlers.createProduct(c, data);
  }
);

/**
 * GET /api/v1/products/:slug
 * Get a single product by slug
 */
shop.get('/products/:slug', async (c) => {
  return shopHandlers.getProduct(c);
});

/**
 * GET /api/v1/categories
 * List all categories
 */
shop.get('/categories', async (c) => {
  return shopHandlers.listCategories(c);
});

/**
 * GET /api/v1/categories/:slug
 * Get category with its products
 */
shop.get('/categories/:slug', async (c) => {
  return shopHandlers.getCategoryProducts(c);
});

export default shop;
