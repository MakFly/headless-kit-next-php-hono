/**
 * Admin repository
 */

import { eq, like, desc, asc, sql, and, inArray } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

// =========================================================================
// Products CRUD
// =========================================================================

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
    description: data.description || null,
    price: data.price,
    compareAtPrice: data.compareAtPrice || null,
    sku: data.sku || null,
    stockQuantity: data.stockQuantity ?? 0,
    categoryId: data.categoryId || null,
    imageUrl: data.imageUrl || null,
    images: data.images || [],
    status: data.status || 'active',
    featured: data.featured || false,
    createdAt: now,
    updatedAt: now,
  });

  return db.query.products.findFirst({
    where: eq(schema.products.id, id),
  });
}

export async function updateProduct(id: string, data: Partial<{
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stockQuantity: number;
  categoryId: string;
  imageUrl: string;
  images: string[];
  status: string;
  featured: boolean;
}>) {
  await db
    .update(schema.products)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.products.id, id));

  return db.query.products.findFirst({
    where: eq(schema.products.id, id),
  });
}

export async function deleteProduct(id: string) {
  const existing = await db.query.products.findFirst({
    where: eq(schema.products.id, id),
  });
  if (!existing) return false;

  await db.delete(schema.products).where(eq(schema.products.id, id));
  return true;
}

// =========================================================================
// Orders
// =========================================================================

export async function findAllOrders(filters: { status?: string; page?: number; per_page?: number } = {}) {
  const page = filters.page || 1;
  const perPage = filters.per_page || 20;
  const offset = (page - 1) * perPage;

  const conditions = [];
  if (filters.status) {
    conditions.push(eq(schema.orders.status, filters.status));
  }

  const results = await db
    .select()
    .from(schema.orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.orders.createdAt))
    .limit(perPage)
    .offset(offset);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  // Get items for each order
  const ordersWithItems = [];
  for (const order of results) {
    const items = await db
      .select()
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, order.id));
    ordersWithItems.push({ ...order, items });
  }

  return {
    data: ordersWithItems,
    pagination: {
      page,
      perPage,
      total: countResult[0].count,
      totalPages: Math.ceil(countResult[0].count / perPage),
    },
  };
}

export async function updateOrderStatus(id: string, status: string) {
  const existing = await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
  });
  if (!existing) return null;

  await db
    .update(schema.orders)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(schema.orders.id, id));

  return db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
  });
}

// =========================================================================
// Dashboard & Analytics
// =========================================================================

export async function getDashboardStats() {
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [revenueResult] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.orders.total}), 0)` })
    .from(schema.orders)
    .where(sql`${schema.orders.createdAt} >= ${firstOfMonth}`);

  const [newOrdersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .where(sql`${schema.orders.createdAt} >= ${firstOfMonth}`);

  const [newCustomersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.customers)
    .where(sql`${schema.customers.createdAt} >= ${firstOfMonth}`);

  const [pendingOrdersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.orders)
    .where(eq(schema.orders.status, 'pending'));

  const [pendingReviewsResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reviews)
    .where(eq(schema.reviews.status, 'pending'));

  // Order chart: last 6 months
  const orderChart = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const monthName = d.toLocaleString('en', { month: 'short' });

    const [result] = await db
      .select({ count: sql<number>`count(*)`, revenue: sql<number>`coalesce(sum(${schema.orders.total}), 0)` })
      .from(schema.orders)
      .where(sql`${schema.orders.createdAt} >= ${start} AND ${schema.orders.createdAt} < ${end}`);

    orderChart.push({
      month: monthName,
      orders: result.count,
      revenue: result.revenue,
    });
  }

  return {
    monthlyRevenue: revenueResult.total,
    nbNewOrders: newOrdersResult.count,
    newCustomers: newCustomersResult.count,
    pendingOrders: pendingOrdersResult.count,
    pendingReviews: pendingReviewsResult.count,
    orderChart,
  };
}

export async function getRevenueAnalytics() {
  const [totalResult] = await db
    .select({ total: sql<number>`coalesce(sum(${schema.orders.total}), 0)` })
    .from(schema.orders);

  const now = new Date();
  const revenueByMonth = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = d.toISOString();
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

    const [result] = await db
      .select({ revenue: sql<number>`coalesce(sum(${schema.orders.total}), 0)` })
      .from(schema.orders)
      .where(sql`${schema.orders.createdAt} >= ${start} AND ${schema.orders.createdAt} < ${end}`);

    revenueByMonth.push({
      month: d.toLocaleString('en', { month: 'short', year: 'numeric' }),
      revenue: result.revenue,
    });
  }

  return { totalRevenue: totalResult.total, revenueByMonth };
}

export async function getTopProducts(limit = 10) {
  const results = await db
    .select({
      productId: schema.orderItems.productId,
      productName: schema.orderItems.productName,
      totalSold: sql<number>`sum(${schema.orderItems.quantity})`.as('total_sold'),
      totalRevenue: sql<number>`sum(${schema.orderItems.subtotal})`.as('total_revenue'),
    })
    .from(schema.orderItems)
    .groupBy(schema.orderItems.productId, schema.orderItems.productName)
    .orderBy(desc(sql`total_sold`))
    .limit(limit);

  return results;
}

// =========================================================================
// Inventory
// =========================================================================

export async function getInventory() {
  return db
    .select({
      id: schema.products.id,
      name: schema.products.name,
      slug: schema.products.slug,
      sku: schema.products.sku,
      stockQuantity: schema.products.stockQuantity,
      status: schema.products.status,
      price: schema.products.price,
    })
    .from(schema.products)
    .orderBy(asc(schema.products.name));
}

export async function updateStock(productId: string, stockQuantity: number) {
  const existing = await db.query.products.findFirst({
    where: eq(schema.products.id, productId),
  });
  if (!existing) return null;

  await db
    .update(schema.products)
    .set({ stockQuantity, updatedAt: new Date().toISOString() })
    .where(eq(schema.products.id, productId));

  return db.query.products.findFirst({
    where: eq(schema.products.id, productId),
  });
}

// =========================================================================
// Customers CRUD
// =========================================================================

export async function findAllCustomers(filters: { segment?: string; search?: string; page?: number; per_page?: number } = {}) {
  const page = filters.page || 1;
  const perPage = filters.per_page || 20;
  const offset = (page - 1) * perPage;

  const conditions = [];
  if (filters.segment) {
    conditions.push(eq(schema.customers.segment, filters.segment));
  }
  if (filters.search) {
    conditions.push(
      sql`(${schema.customers.firstName} || ' ' || ${schema.customers.lastName}) LIKE ${'%' + filters.search + '%'} OR ${schema.customers.email} LIKE ${'%' + filters.search + '%'}`
    );
  }

  const results = await db
    .select()
    .from(schema.customers)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.customers.createdAt))
    .limit(perPage)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.customers)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    data: results,
    pagination: {
      page,
      perPage,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / perPage),
    },
  };
}

export async function findCustomerById(id: string) {
  return db.query.customers.findFirst({
    where: eq(schema.customers.id, id),
  }) ?? null;
}

export async function createCustomer(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: { street: string; city: string; state: string; zip: string; country: string };
  segment?: string;
}) {
  const id = crypto.randomUUID();
  await db.insert(schema.customers).values({
    id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone || null,
    address: data.address || null,
    segment: data.segment || null,
    createdAt: new Date().toISOString(),
  });

  return db.query.customers.findFirst({
    where: eq(schema.customers.id, id),
  });
}

export async function updateCustomer(id: string, data: Partial<{
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: { street: string; city: string; state: string; zip: string; country: string };
  segment: string;
}>) {
  const existing = await findCustomerById(id);
  if (!existing) return null;

  await db
    .update(schema.customers)
    .set(data)
    .where(eq(schema.customers.id, id));

  return db.query.customers.findFirst({
    where: eq(schema.customers.id, id),
  });
}

export async function deleteCustomer(id: string) {
  const existing = await findCustomerById(id);
  if (!existing) return false;

  await db.delete(schema.customers).where(eq(schema.customers.id, id));
  return true;
}

// =========================================================================
// Reviews
// =========================================================================

export async function findAllReviews(filters: { status?: string; rating?: number; page?: number; per_page?: number } = {}) {
  const page = filters.page || 1;
  const perPage = filters.per_page || 20;
  const offset = (page - 1) * perPage;

  const conditions = [];
  if (filters.status) {
    conditions.push(eq(schema.reviews.status, filters.status));
  }
  if (filters.rating !== undefined) {
    conditions.push(eq(schema.reviews.rating, filters.rating));
  }

  const results = await db
    .select({
      id: schema.reviews.id,
      productId: schema.reviews.productId,
      customerId: schema.reviews.customerId,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      status: schema.reviews.status,
      createdAt: schema.reviews.createdAt,
      productName: schema.products.name,
      customerFirstName: schema.customers.firstName,
      customerLastName: schema.customers.lastName,
    })
    .from(schema.reviews)
    .leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
    .leftJoin(schema.customers, eq(schema.reviews.customerId, schema.customers.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(schema.reviews.createdAt))
    .limit(perPage)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.reviews)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return {
    data: results.map((r) => ({
      id: r.id,
      productId: r.productId,
      customerId: r.customerId,
      rating: r.rating,
      comment: r.comment,
      status: r.status,
      createdAt: r.createdAt,
      productName: r.productName,
      customerName: `${r.customerFirstName} ${r.customerLastName}`,
    })),
    pagination: {
      page,
      perPage,
      total: countResult.count,
      totalPages: Math.ceil(countResult.count / perPage),
    },
  };
}

export async function findReviewById(id: string) {
  const result = await db
    .select({
      id: schema.reviews.id,
      productId: schema.reviews.productId,
      customerId: schema.reviews.customerId,
      rating: schema.reviews.rating,
      comment: schema.reviews.comment,
      status: schema.reviews.status,
      createdAt: schema.reviews.createdAt,
      productName: schema.products.name,
      customerFirstName: schema.customers.firstName,
      customerLastName: schema.customers.lastName,
    })
    .from(schema.reviews)
    .leftJoin(schema.products, eq(schema.reviews.productId, schema.products.id))
    .leftJoin(schema.customers, eq(schema.reviews.customerId, schema.customers.id))
    .where(eq(schema.reviews.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const r = result[0];
  return {
    id: r.id,
    productId: r.productId,
    customerId: r.customerId,
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    createdAt: r.createdAt,
    productName: r.productName,
    customerName: `${r.customerFirstName} ${r.customerLastName}`,
  };
}

export async function updateReview(id: string, data: Partial<{ rating: number; comment: string; status: string }>) {
  const existing = await db.query.reviews.findFirst({
    where: eq(schema.reviews.id, id),
  });
  if (!existing) return null;

  await db
    .update(schema.reviews)
    .set(data)
    .where(eq(schema.reviews.id, id));

  return findReviewById(id);
}

export async function bulkUpdateReviewStatus(ids: string[], status: string) {
  await db
    .update(schema.reviews)
    .set({ status })
    .where(inArray(schema.reviews.id, ids));

  return { updated: ids.length };
}

// =========================================================================
// Segments
// =========================================================================

export async function findAllSegments() {
  const segmentsList = await db.select().from(schema.segments);

  const result = [];
  for (const seg of segmentsList) {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.customers)
      .where(eq(schema.customers.segment, seg.slug));

    result.push({
      id: seg.id,
      name: seg.name,
      slug: seg.slug,
      customerCount: countResult.count,
    });
  }

  return result;
}
