/**
 * Cart service
 */

import * as cartRepository from './cart.repository.ts';
import { findProductById } from '../shop/shop.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

/**
 * Get current user's cart with items
 */
export async function getCart(userId: string) {
  return cartRepository.getCartWithItems(userId);
}

/**
 * Add item to cart
 */
export async function addItem(userId: string, productId: string, quantity: number) {
  const product = await findProductById(productId);
  if (!product) {
    throw new AppError('Product not found', 'PRODUCT_NOT_FOUND', 404);
  }

  if (product.status !== 'active') {
    throw new AppError('Product is not available', 'PRODUCT_UNAVAILABLE', 422);
  }

  const cart = await cartRepository.findOrCreateByUserId(userId);

  const existingItem = await cartRepository.findCartItem(cart.id, productId);
  const totalQty = (existingItem?.quantity || 0) + quantity;

  if (totalQty > (product.stockQuantity || 0)) {
    throw new AppError('Insufficient stock', 'INSUFFICIENT_STOCK', 422);
  }

  await cartRepository.addItem(cart.id, productId, quantity);

  return cartRepository.getCartWithItems(userId);
}

/**
 * Update cart item quantity
 */
export async function updateItem(userId: string, itemId: string, quantity: number) {
  const cart = await cartRepository.findOrCreateByUserId(userId);
  const item = await cartRepository.findCartItemById(itemId);

  if (!item) {
    throw new AppError('Cart item not found', 'ITEM_NOT_FOUND', 404);
  }

  if (item.cartId !== cart.id) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  if (quantity <= 0) {
    await cartRepository.removeItem(itemId);
  } else {
    const product = await findProductById(item.productId);
    if (product && quantity > (product.stockQuantity || 0)) {
      throw new AppError('Insufficient stock', 'INSUFFICIENT_STOCK', 422);
    }
    await cartRepository.updateItemQuantity(itemId, quantity);
  }

  return cartRepository.getCartWithItems(userId);
}

/**
 * Remove item from cart
 */
export async function removeItem(userId: string, itemId: string) {
  const cart = await cartRepository.findOrCreateByUserId(userId);
  const item = await cartRepository.findCartItemById(itemId);

  if (!item) {
    throw new AppError('Cart item not found', 'ITEM_NOT_FOUND', 404);
  }

  if (item.cartId !== cart.id) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  await cartRepository.removeItem(itemId);

  return cartRepository.getCartWithItems(userId);
}
