/**
 * Admin validation schemas
 */

import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().min(1, 'slug is required'),
  description: z.string().optional(),
  price: z.number().int().nonnegative('price must be non-negative'),
  compareAtPrice: z.number().int().nonnegative().optional(),
  sku: z.string().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
  featured: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

export const updateInventorySchema = z.object({
  stockQuantity: z.number().int().nonnegative('stockQuantity must be non-negative'),
});

export const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'firstName is required'),
  lastName: z.string().min(1, 'lastName is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zip: z.string(),
    country: z.string(),
  }).optional(),
  segment: z.string().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const bulkReviewActionSchema = z.object({
  ids: z.array(z.string()).min(1, 'ids array is required'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
