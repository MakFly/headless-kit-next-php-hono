/**
 * Cart validation schemas
 */

import { z } from 'zod';

export const addItemSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive('quantity must be at least 1').default(1),
});

export const updateItemSchema = z.object({
  quantity: z.number().int().nonnegative('quantity must be 0 or more'),
});

export type AddItemInput = z.infer<typeof addItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
