/**
 * Integration tests for cart endpoints
 */

import { describe, it, expect, beforeAll, beforeEach } from 'bun:test';
import { createMiddleware } from 'hono/factory';
import * as cartHandler from '../../../features/cart/cart.handlers.ts';
import { seedShop } from '../../../shared/db/seeders/shop.seed.ts';
import { db, schema } from '../../../shared/db/index.ts';
import { eq } from 'drizzle-orm';
import type { AppVariables } from '../../../shared/types/index.ts';
import { createTestApp } from '../../helpers/test-app.ts';

const TEST_USER_ID = 'user-00000000-0000-0000-0000-000000000002';

// Fake auth middleware that injects a test user
const fakeAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
  c.set('user', {
    id: TEST_USER_ID,
    email: 'test@test.com',
    name: 'Test User',
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

// Build test app with fake auth (bypassing real authMiddleware in route files)
const app = createTestApp();
app.use('*', fakeAuth);

app.get('/api/v1/cart', (c) => cartHandler.getCart(c));
app.post('/api/v1/cart/items', (c) => cartHandler.addItem(c));
app.patch('/api/v1/cart/items/:id', (c) => cartHandler.updateItem(c));
app.delete('/api/v1/cart/items/:id', (c) => cartHandler.removeItem(c));

let electronicsProductId: string;

beforeAll(async () => {
  await seedShop();

  const product = await db.query.products.findFirst({
    where: eq(schema.products.slug, 'wireless-nc-headphones'),
  });
  electronicsProductId = product!.id;
});

beforeEach(async () => {
  const cart = await db.query.carts.findFirst({
    where: eq(schema.carts.userId, TEST_USER_ID),
  });
  if (cart) {
    await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));
    await db.delete(schema.carts).where(eq(schema.carts.id, cart.id));
  }
});

describe('Cart Endpoints', () => {
  describe('GET /api/v1/cart', () => {
    it('should return empty cart', async () => {
      const res = await app.request('/api/v1/cart');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.id).toBeDefined();
      expect(data.items).toBeArray();
      expect(data.items.length).toBe(0);
      expect(data.total).toBe(0);
    });
  });

  describe('POST /api/v1/cart/items', () => {
    it('should add item to cart', async () => {
      const res = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 2 }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.items.length).toBe(1);
      expect(data.items[0].productId).toBe(electronicsProductId);
      expect(data.items[0].quantity).toBe(2);
      expect(data.total).toBe(29999 * 2);
    });

    it('should increment quantity if product already in cart', async () => {
      await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });

      const res = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 2 }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.items.length).toBe(1);
      expect(data.items[0].quantity).toBe(3);
    });

    it('should reject nonexistent product', async () => {
      const res = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: 'nonexistent-id', quantity: 1 }),
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('PRODUCT_NOT_FOUND');
    });

    it('should reject if quantity exceeds stock', async () => {
      const res = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 99999 }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INSUFFICIENT_STOCK');
    });
  });

  describe('PATCH /api/v1/cart/items/:id', () => {
    it('should update item quantity', async () => {
      const addRes = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });
      const addBody = await addRes.json();
      const itemId = addBody.data.items[0].id;

      const res = await app.request(`/api/v1/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 5 }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items[0].quantity).toBe(5);
    });

    it('should remove item if quantity is 0', async () => {
      const addRes = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });
      const addBody = await addRes.json();
      const itemId = addBody.data.items[0].id;

      const res = await app.request(`/api/v1/cart/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 0 }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items.length).toBe(0);
    });
  });

  describe('DELETE /api/v1/cart/items/:id', () => {
    it('should remove item from cart', async () => {
      const addRes = await app.request('/api/v1/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: electronicsProductId, quantity: 1 }),
      });
      const addBody = await addRes.json();
      const itemId = addBody.data.items[0].id;

      const res = await app.request(`/api/v1/cart/items/${itemId}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.items.length).toBe(0);
    });

    it('should return 404 for nonexistent item', async () => {
      const res = await app.request('/api/v1/cart/items/nonexistent-id', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('ITEM_NOT_FOUND');
    });
  });
});
