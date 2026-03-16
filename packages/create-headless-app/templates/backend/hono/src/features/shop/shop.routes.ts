/**
 * Shop routes
 */

import { Hono } from 'hono';
import * as shopHandlers from './shop.handlers.ts';
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
