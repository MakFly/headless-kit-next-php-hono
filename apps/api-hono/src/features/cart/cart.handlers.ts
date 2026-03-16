/**
 * Cart handlers
 */

import type { Context } from 'hono';
import * as cartService from './cart.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';
import { requireUser } from '../../shared/middleware/auth.ts';
import type { AppVariables } from '../../shared/types/index.ts';

/**
 * Get current user's cart
 */
export async function getCart(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const cart = await cartService.getCart(user.id);
  return apiSuccess(c, cart);
}

/**
 * Add item to cart
 */
export async function addItem(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const body = await c.req.json();

  const { productId, quantity = 1 } = body;
  if (!productId) {
    throw new AppError('productId is required', 'VALIDATION_ERROR', 400);
  }

  if (quantity < 1) {
    throw new AppError('quantity must be at least 1', 'VALIDATION_ERROR', 400);
  }

  const cart = await cartService.addItem(user.id, productId, quantity);
  return apiSuccess(c, cart);
}

/**
 * Update cart item quantity
 */
export async function updateItem(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const itemId = c.req.param('id');
  const body = await c.req.json();

  const { quantity } = body;
  if (quantity === undefined || quantity === null) {
    throw new AppError('quantity is required', 'VALIDATION_ERROR', 400);
  }

  const cart = await cartService.updateItem(user.id, itemId, quantity);
  return apiSuccess(c, cart);
}

/**
 * Remove item from cart
 */
export async function removeItem(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const itemId = c.req.param('id');
  const cart = await cartService.removeItem(user.id, itemId);
  return apiSuccess(c, cart);
}
