/**
 * Cart routes
 */

import { Hono } from 'hono';
import * as cartHandlers from './cart.handlers.ts';
import { authMiddleware } from '../../shared/middleware/index.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const cart = new Hono<{ Variables: AppVariables }>();

cart.use('*', authMiddleware);

/**
 * GET /api/v1/cart
 * Get current user's cart with items
 */
cart.get('/', async (c) => {
  return cartHandlers.getCart(c);
});

/**
 * POST /api/v1/cart/items
 * Add item to cart
 */
cart.post('/items', async (c) => {
  return cartHandlers.addItem(c);
});

/**
 * PATCH /api/v1/cart/items/:id
 * Update cart item quantity
 */
cart.patch('/items/:id', async (c) => {
  return cartHandlers.updateItem(c);
});

/**
 * DELETE /api/v1/cart/items/:id
 * Remove item from cart
 */
cart.delete('/items/:id', async (c) => {
  return cartHandlers.removeItem(c);
});

export default cart;
