/**
 * Order service
 */

import { eq } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';
import * as ordersRepository from './orders.repository.ts';
import * as cartRepository from '../cart/cart.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

/**
 * Create order from user's cart
 */
export async function createFromCart(
  userId: string,
  shippingAddress: ShippingAddress,
  notes?: string
) {
  const cart = await cartRepository.findOrCreateByUserId(userId);
  const items = await cartRepository.getItemsWithProducts(cart.id);

  if (items.length === 0) {
    throw new AppError('Cart is empty', 'CART_EMPTY', 422);
  }

  const orderItems = [];
  let total = 0;

  for (const item of items) {
    if (item.productStatus !== 'active') {
      throw new AppError(
        `Product "${item.productName}" is no longer available`,
        'PRODUCT_UNAVAILABLE',
        422
      );
    }

    if (item.quantity > (item.productStockQuantity || 0)) {
      throw new AppError(
        `Insufficient stock for "${item.productName}"`,
        'INSUFFICIENT_STOCK',
        422
      );
    }

    const subtotal = item.productPrice * item.quantity;
    total += subtotal;

    orderItems.push({
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
      subtotal,
    });
  }

  const order = await ordersRepository.create({
    userId,
    total,
    shippingAddress,
    notes,
    items: orderItems,
  });

  for (const item of items) {
    await db
      .update(schema.products)
      .set({
        stockQuantity: (item.productStockQuantity || 0) - item.quantity,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.products.id, item.productId));
  }

  await cartRepository.clearCart(cart.id);

  return order;
}

/**
 * Get user's orders
 */
export async function getOrders(userId: string) {
  return ordersRepository.findByUserId(userId);
}

/**
 * Get order detail (with ownership check)
 */
export async function getOrder(userId: string, orderId: string) {
  const order = await ordersRepository.findById(orderId);

  if (!order) {
    throw new AppError('Order not found', 'NOT_FOUND', 404);
  }

  if (order.userId !== userId) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  return order;
}
