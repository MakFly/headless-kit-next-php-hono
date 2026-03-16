/**
 * Orders routes
 */

import { Hono } from 'hono';
import * as ordersHandlers from './orders.handlers.ts';
import { authMiddleware } from '../../shared/middleware/index.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const orders = new Hono<{ Variables: AppVariables }>();

orders.use('*', authMiddleware);

/**
 * POST /api/v1/orders
 * Create order from cart
 */
orders.post('/', async (c) => {
  return ordersHandlers.createOrder(c);
});

/**
 * GET /api/v1/orders
 * List user's orders
 */
orders.get('/', async (c) => {
  return ordersHandlers.listOrders(c);
});

/**
 * GET /api/v1/orders/:id
 * Get order detail
 */
orders.get('/:id', async (c) => {
  return ordersHandlers.getOrder(c);
});

export default orders;
