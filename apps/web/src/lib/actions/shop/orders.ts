'use server';

import { bffGet, bffPost } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { Order, ShippingAddress } from '@/types/shop';

export async function getOrdersAction(): Promise<Order[]> {
  const response = await bffGet<unknown>('/api/v1/orders');
  return unwrapEnvelope<Order[]>(response);
}

export async function getOrderAction(id: string): Promise<Order> {
  const response = await bffGet<unknown>(`/api/v1/orders/${id}`);
  return unwrapEnvelope<Order>(response);
}

export async function createOrderAction(shippingAddress: ShippingAddress): Promise<Order> {
  const response = await bffPost<unknown>('/api/v1/orders', {
    shipping_address: shippingAddress,
  });
  return unwrapEnvelope<Order>(response);
}
