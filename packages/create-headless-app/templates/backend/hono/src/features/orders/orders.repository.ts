/**
 * Orders repository
 */

import { eq, desc } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

type OrderItemInput = {
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
};

/**
 * Create an order with items
 */
export async function create(data: {
  userId: string;
  total: number;
  shippingAddress: ShippingAddress;
  notes?: string;
  items: OrderItemInput[];
}) {
  const orderId = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.orders).values({
    id: orderId,
    userId: data.userId,
    total: data.total,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: data.shippingAddress,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  });

  for (const item of data.items) {
    await db.insert(schema.orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
      subtotal: item.subtotal,
    });
  }

  return findById(orderId);
}

/**
 * Find order by ID with items
 */
export async function findById(id: string) {
  const order = await db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
  });

  if (!order) return null;

  const items = await db
    .select({
      id: schema.orderItems.id,
      productId: schema.orderItems.productId,
      productName: schema.orderItems.productName,
      productPrice: schema.orderItems.productPrice,
      quantity: schema.orderItems.quantity,
      subtotal: schema.orderItems.subtotal,
    })
    .from(schema.orderItems)
    .where(eq(schema.orderItems.orderId, id));

  return {
    id: order.id,
    userId: order.userId,
    status: order.status,
    total: order.total,
    paymentStatus: order.paymentStatus,
    shippingAddress: order.shippingAddress,
    notes: order.notes,
    items,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * Find all orders for a user
 */
export async function findByUserId(userId: string) {
  const userOrders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt));

  const result = [];
  for (const order of userOrders) {
    const items = await db
      .select({
        id: schema.orderItems.id,
        productId: schema.orderItems.productId,
        productName: schema.orderItems.productName,
        productPrice: schema.orderItems.productPrice,
        quantity: schema.orderItems.quantity,
        subtotal: schema.orderItems.subtotal,
      })
      .from(schema.orderItems)
      .where(eq(schema.orderItems.orderId, order.id));

    result.push({
      id: order.id,
      userId: order.userId,
      status: order.status,
      total: order.total,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      notes: order.notes,
      items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    });
  }

  return result;
}
