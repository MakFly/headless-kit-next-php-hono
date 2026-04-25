/**
 * Shop repository — merges product and category repositories
 */

import { eq, like, sql, and, gte, lte, asc, desc } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

export type ProductFilters = {
  category?: string;
  search?: string;
  sort?: string;
  min_price?: number;
  max_price?: number;
  page?: number;
  per_page?: number;
};

// =========================================================================
// Products
// =========================================================================

/**
 * Find all products with filters and pagination
 */
export async function findAllProducts(filters: ProductFilters = {}) {
  const page = filters.page || 1;
  const perPage = filters.per_page || 12;
  const offset = (page - 1) * perPage;

  const conditions = buildProductConditions(filters);
  const orderBy = buildOrderBy(filters.sort);

  const results = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      description: schema.products.description,
      price: schema.products.price,
      compareAtPrice: schema.products.compareAtPrice,
      sku: schema.products.sku,
      stockQuantity: schema.products.stockQuantity,
      categoryId: schema.products.categoryId,
      imageUrl: schema.products.imageUrl,
      images: schema.products.images,
      status: schema.products.status,
      featured: schema.products.featured,
      createdAt: schema.products.createdAt,
      updatedAt: schema.products.updatedAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(perPage)
    .offset(offset);

  return results.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    sku: row.sku,
    stockQuantity: row.stockQuantity,
    categoryId: row.categoryId,
    imageUrl: row.imageUrl,
    images: row.images,
    status: row.status,
    featured: row.featured,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName!, slug: row.categorySlug! }
      : null,
  }));
}

/**
 * Count products matching filters
 */
export async function countProducts(filters: ProductFilters = {}): Promise<number> {
  const conditions = buildProductConditions(filters);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return result[0].count;
}

/**
 * Find product by slug with category
 */
export async function findProductBySlug(slug: string) {
  const result = await db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      description: schema.products.description,
      price: schema.products.price,
      compareAtPrice: schema.products.compareAtPrice,
      sku: schema.products.sku,
      stockQuantity: schema.products.stockQuantity,
      categoryId: schema.products.categoryId,
      imageUrl: schema.products.imageUrl,
      images: schema.products.images,
      status: schema.products.status,
      featured: schema.products.featured,
      createdAt: schema.products.createdAt,
      updatedAt: schema.products.updatedAt,
      categoryName: schema.categories.name,
      categorySlug: schema.categories.slug,
    })
    .from(schema.products)
    .leftJoin(schema.categories, eq(schema.products.categoryId, schema.categories.id))
    .where(eq(schema.products.slug, slug))
    .limit(1);

  if (result.length === 0) return null;

  const row = result[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    sku: row.sku,
    stockQuantity: row.stockQuantity,
    categoryId: row.categoryId,
    imageUrl: row.imageUrl,
    images: row.images,
    status: row.status,
    featured: row.featured,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    category: row.categoryId
      ? { id: row.categoryId, name: row.categoryName!, slug: row.categorySlug! }
      : null,
  };
}

/**
 * Find product by ID
 */
export async function findProductById(id: string) {
  const result = await db.query.products.findFirst({
    where: eq(schema.products.id, id),
  });

  return result || null;
}

/**
 * Create a new product
 */
export async function createProduct(data: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stockQuantity?: number;
  categoryId?: string;
  imageUrl?: string;
  images?: string[];
  status?: string;
  featured?: boolean;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.products).values({
    id,
    name: data.name,
    slug: data.slug,
    description: data.description ?? null,
    price: data.price,
    compareAtPrice: data.compareAtPrice ?? null,
    sku: data.sku ?? null,
    stockQuantity: data.stockQuantity ?? 0,
    categoryId: data.categoryId ?? null,
    imageUrl: data.imageUrl ?? null,
    images: data.images ?? [],
    status: data.status ?? 'draft',
    featured: data.featured ?? false,
    createdAt: now,
    updatedAt: now,
  });

  return findProductById(id);
}

// =========================================================================
// Categories
// =========================================================================

/**
 * Find all categories with product count
 */
export async function findAllCategories() {
  const results = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
      description: schema.categories.description,
      imageUrl: schema.categories.imageUrl,
      sortOrder: schema.categories.sortOrder,
      productCount: sql<number>`count(${schema.products.id})`.as('product_count'),
    })
    .from(schema.categories)
    .leftJoin(schema.products, eq(schema.products.categoryId, schema.categories.id))
    .groupBy(schema.categories.id)
    .orderBy(schema.categories.sortOrder);

  return results;
}

/**
 * Find category by slug
 */
export async function findCategoryBySlug(slug: string) {
  const result = await db.query.categories.findFirst({
    where: eq(schema.categories.slug, slug),
  });

  return result || null;
}

// =========================================================================
// Helpers
// =========================================================================

function buildProductConditions(filters: ProductFilters) {
  const conditions = [];

  if (filters.category) {
    conditions.push(eq(schema.categories.slug, filters.category));
  }

  if (filters.search) {
    conditions.push(like(schema.products.name, `%${filters.search}%`));
  }

  if (filters.min_price !== undefined) {
    conditions.push(gte(schema.products.price, filters.min_price));
  }

  if (filters.max_price !== undefined) {
    conditions.push(lte(schema.products.price, filters.max_price));
  }

  return conditions;
}

function buildOrderBy(sort?: string) {
  switch (sort) {
    case 'price_asc':
      return [asc(schema.products.price)];
    case 'price_desc':
      return [desc(schema.products.price)];
    case 'name_asc':
      return [asc(schema.products.name)];
    case 'newest':
      return [desc(schema.products.createdAt)];
    default:
      return [desc(schema.products.createdAt)];
  }
}
