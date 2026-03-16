/**
 * Integration tests for order endpoints
 */

import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import { createMiddleware } from 'hono/factory';
import * as cartHandler from '../../../features/cart/cart.handlers.ts';
import * as orderHandler from '../../../features/orders/orders.handlers.ts';
import { seedShop } from '../../../shared/db/seeders/shop.seed.ts';
import { db, schema } from '../../../shared/db/index.ts';
import { eq } from 'drizzle-orm';
import type { AppVariables } from '../../../shared/types/index.ts';
import { createTestApp } from '../../helpers/test-app.ts';

const TEST_USER_ID = 'user-00000000-0000-0000-0000-000000000002';
const OTHER_USER_ID = 'user-00000000-0000-0000-0000-000000000003';

const shippingAddress = {
  street: '123 Main St',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  country: 'US',
};

function fakeAuthFor(userId: string) {
  return createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    c.set('user', {
      id: userId,
      email: userId === TEST_USER_ID ? 'test@test.com' : 'other@test.com',
      name: userId === TEST_USER_ID ? 'Test User' : 'Other User',
      emailVerifiedAt: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    c.set('jwtPayload', null);
    c.set('requestId', 'test-request-id');
    c.set('locale', 'en');
    await next();
  });
}

// Build test app with fake auth
const app = createTestApp();
app.use('*', fakeAuthFor(TEST_USER_ID));
app.get('/api/v1/cart', (c) => cartHandler.getCart(c));
app.post('/api/v1/cart/items', (c) => cartHandler.addItem(c));
app.post('/api/v1/orders', (c) => orderHandler.createOrder(c));
app.get('/api/v1/orders', (c) => orderHandler.listOrders(c));
app.get('/api/v1/orders/:id', (c) => orderHandler.getOrder(c));

// Other user app for ownership tests
const otherApp = createTestApp();
otherApp.use('*', fakeAuthFor(OTHER_USER_ID));
otherApp.get('/api/v1/orders/:id', (c) => orderHandler.getOrder(c));

let electronicsProductId: string;

beforeAll(async () => {
  await seedShop();

  const product = await db.query.products.findFirst({
    where: eq(schema.products.slug, 'wireless-nc-headphones'),
  });
  electronicsProductId = product!.id;
});

beforeEach(async () => {
  // Clean orders for test user
  const userOrders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, TEST_USER_ID));

  for (const order of userOrders) {
    await db.delete(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
  }
  await db.delete(schema.orders).where(eq(schema.orders.userId, TEST_USER_ID));

  // Clean cart for test user
  const cart = await db.query.carts.findFirst({
    where: eq(schema.carts.userId, TEST_USER_ID),
  });
  if (cart) {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));
    await db.delete(schema.carts).where(eq(schema.carts.id, cart.id));
  }

  // Reset product stock
  await db
    .update(schema.products)
    .set({ stockQuantity: 150 })
    .where(eq(schema.products.id, electronicsProductId));
});

describe('Order Endpoints', () => {
  describe('POST /api/v1/orders', () => {
    it('should create order from cart', async () => {
      // Add item to cart
      await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 2 }),
      });

      // Create order
      const res = await app.request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }),
      });

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.id).toBeDefined();
      expect(data.status).toBe('pending');
      expect(data.paymentStatus).toBe('pending');
      expect(data.total).toBe(29999 * 2);
      expect(data.items).toBeArray();
      expect(data.items.length).toBe(1);
      expect(data.items[0].productName).toBe('Wireless Noise-Cancelling Headphones');
      expect(data.items[0].quantity).toBe(2);
      expect(data.shippingAddress.city).toBe('Springfield');

      // Verify cart is now empty
      const cartRes = await app.request('/api/v1/cart');
      const cartBody = await cartRes.json();
      expect(cartBody.data.items.length).toBe(0);

      // Verify stock was decremented
      const product = await db.query.products.findFirst({
        where: eq(schema.products.id, electronicsProductId),
      });
      expect(product!.stockQuantity).toBe(148);
    });

    it('should reject order with empty cart', async () => {
      const res = await app.request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CART_EMPTY');
    });

    it('should reject order without shipping address', async () => {
      await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });

      const res = await app.request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/orders', () => {
    it('should list user orders', async () => {
      // Create an order
      await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });
      await app.request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }),
      });

      const res = await app.request('/api/v1/orders');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].items).toBeArray();
    });

    it('should return empty array if no orders', async () => {
      const res = await app.request('/api/v1/orders');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(0);
    });
  });

  describe('GET /api/v1/orders/:id', () => {
    it('should return order detail', async () => {
      await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });
      const createRes = await app.request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }),
      });
      const created = await createRes.json();

      const res = await app.request(`/api/v1/orders/${created.data.id}`);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(created.data.id);
      expect(body.data.items).toBeArray();
      expect(body.data.items.length).toBe(1);
    });

    it('should return 404 for nonexistent order', async () => {
      const res = await app.request('/api/v1/orders/nonexistent-id');
      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 for another user order', async () => {
      // Create order as TEST_USER
      await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });
      const createRes = await app.request('/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shippingAddress }),
      });
      const created = await createRes.json();

      // Try to access as OTHER_USER
      const res = await otherApp.request(`/api/v1/orders/${created.data.id}`);
      expect(res.status).toBe(403);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
    });
  });
});
