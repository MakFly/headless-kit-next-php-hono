'use server';

import { bffGet, bffPost, bffPatch, bffDelete } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { Cart } from '@/types/shop';

export async function getCartAction(): Promise<Cart> {
  const response = await bffGet<unknown>('/api/v1/cart');
  return unwrapEnvelope<Cart>(response);
}

export async function addToCartAction(productId: string, quantity: number = 1): Promise<Cart> {
  const response = await bffPost<unknown>('/api/v1/cart/items', {
    product_id: productId,
    quantity,
  });
  return unwrapEnvelope<Cart>(response);
}

export async function updateCartItemAction(itemId: string, quantity: number): Promise<Cart> {
  const response = await bffPatch<unknown>(`/api/v1/cart/items/${itemId}`, {
    quantity,
  });
  return unwrapEnvelope<Cart>(response);
}

export async function removeCartItemAction(itemId: string): Promise<Cart> {
  const response = await bffDelete<unknown>(`/api/v1/cart/items/${itemId}`);
  return unwrapEnvelope<Cart>(response);
}
