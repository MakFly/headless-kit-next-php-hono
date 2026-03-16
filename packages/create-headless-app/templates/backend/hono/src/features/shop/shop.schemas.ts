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
