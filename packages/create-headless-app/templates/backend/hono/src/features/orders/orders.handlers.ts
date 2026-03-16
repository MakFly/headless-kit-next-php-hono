/**
 * Orders handlers
 */

import type { Context } from 'hono';
import * as ordersService from './orders.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';
import { requireUser } from '../../shared/middleware/auth.ts';
import type { AppVariables } from '../../shared/types/index.ts';

/**
 * Create order from cart
 */
export async function createOrder(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const body = await c.req.json();

  const { shippingAddress, notes } = body;
  if (!shippingAddress) {
    throw new AppError('shippingAddress is required', 'VALIDATION_ERROR', 400);
  }

  const required = ['street', 'city', 'state', 'zip', 'country'];
  for (const field of required) {
    if (!shippingAddress[field]) {
      throw new AppError(`shippingAddress.${field} is required`, 'VALIDATION_ERROR', 400);
    }
  }

  const order = await ordersService.createFromCart(user.id, shippingAddress, notes);
  return apiSuccess(c, order, undefined, 201);
}

/**
 * List user's orders
 */
export async function listOrders(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const orders = await ordersService.getOrders(user.id);
  return apiSuccess(c, orders);
}

/**
 * Get order detail
 */
export async function getOrder(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const orderId = c.req.param('id');
  const order = await ordersService.getOrder(user.id, orderId);
  return apiSuccess(c, order);
}
