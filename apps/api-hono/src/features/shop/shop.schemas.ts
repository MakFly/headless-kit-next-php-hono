/**
 * Shop validation schemas
 */

import { z } from 'zod';

export const productFiltersSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'name_asc', 'newest']).optional(),
  min_price: z.coerce.number().int().nonnegative().optional(),
  max_price: z.coerce.number().int().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(100).default(12),
});

export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;

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

export type CreateProductInput = z.infer<typeof createProductSchema>;
