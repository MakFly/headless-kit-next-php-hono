/**
 * Orders validation schemas
 */

import { z } from 'zod';

export const shippingAddressSchema = z.object({
  street: z.string().min(1, 'street is required'),
  city: z.string().min(1, 'city is required'),
  state: z.string().min(1, 'state is required'),
  zip: z.string().min(1, 'zip is required'),
  country: z.string().min(1, 'country is required'),
});

export const createOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  notes: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
