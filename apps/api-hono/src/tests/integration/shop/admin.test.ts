/**
 * Integration tests for admin endpoints
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { createMiddleware } from 'hono/factory';
import * as adminHandler from '../../../features/admin/admin.handlers.ts';
import { seedShop } from '../../../shared/db/seeders/shop.seed.ts';
import { seedAdmin } from '../../../shared/db/seeders/admin.seed.ts';
import { db, schema } from '../../../shared/db/index.ts';
import { eq } from 'drizzle-orm';
import type { AppVariables } from '../../../shared/types/index.ts';
import { createTestApp } from '../../helpers/test-app.ts';

const ADMIN_USER_ID = 'admin-00000000-0000-0000-0000-000000000001';
const REGULAR_USER_ID = 'user-00000000-0000-0000-0000-000000000002';

function fakeAuthFor(userId: string, isAdmin: boolean) {
  return createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    c.set('user', {
      id: userId,
      email: isAdmin ? 'admin@example.com' : 'test@test.com',
      name: isAdmin ? 'Admin User' : 'Test User',
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

// Admin app - bypasses real auth/admin middleware, calls handlers directly
const adminApp = createTestApp();
adminApp.use('*', fakeAuthFor(ADMIN_USER_ID, true));

// Products
adminApp.get('/api/v1/admin/products', (c) => adminHandler.listProducts(c));
adminApp.post('/api/v1/admin/products', (c) => adminHandler.createProduct(c));
adminApp.put('/api/v1/admin/products/:id', (c) => adminHandler.updateProduct(c));
adminApp.delete('/api/v1/admin/products/:id', (c) => adminHandler.deleteProduct(c));

// Orders
adminApp.get('/api/v1/admin/orders', (c) => adminHandler.listOrders(c));
adminApp.patch('/api/v1/admin/orders/:id/status', (c) => adminHandler.updateOrderStatus(c));

// Dashboard & Analytics
adminApp.get('/api/v1/admin/dashboard', (c) => adminHandler.getDashboard(c));
adminApp.get('/api/v1/admin/analytics/revenue', (c) => adminHandler.getRevenueAnalytics(c));
adminApp.get('/api/v1/admin/analytics/top-products', (c) => adminHandler.getTopProducts(c));

// Inventory
adminApp.get('/api/v1/admin/inventory', (c) => adminHandler.getInventory(c));
adminApp.patch('/api/v1/admin/inventory/:productId', (c) => adminHandler.updateInventory(c));

// Customers
adminApp.get('/api/v1/admin/customers', (c) => adminHandler.listCustomers(c));
adminApp.post('/api/v1/admin/customers', (c) => adminHandler.createCustomer(c));
adminApp.get('/api/v1/admin/customers/:id', (c) => adminHandler.getCustomer(c));
adminApp.put('/api/v1/admin/customers/:id', (c) => adminHandler.updateCustomer(c));
adminApp.delete('/api/v1/admin/customers/:id', (c) => adminHandler.deleteCustomer(c));

// Reviews
adminApp.get('/api/v1/admin/reviews', (c) => adminHandler.listReviews(c));
adminApp.get('/api/v1/admin/reviews/:id', (c) => adminHandler.getReview(c));
adminApp.put('/api/v1/admin/reviews/:id', (c) => adminHandler.updateReview(c));
adminApp.post('/api/v1/admin/reviews/bulk-approve', (c) => adminHandler.bulkApproveReviews(c));
adminApp.post('/api/v1/admin/reviews/bulk-reject', (c) => adminHandler.bulkRejectReviews(c));

// Segments
adminApp.get('/api/v1/admin/segments', (c) => adminHandler.listSegments(c));

// Non-admin app - uses real admin middleware to test 403
import { adminMiddleware } from '../../../shared/middleware/admin.ts';

const nonAdminApp = createTestApp();
nonAdminApp.use('*', fakeAuthFor(REGULAR_USER_ID, false));
nonAdminApp.use('*', adminMiddleware);
nonAdminApp.get('/api/v1/admin/products', (c) => adminHandler.listProducts(c));
nonAdminApp.get('/api/v1/admin/dashboard', (c) => adminHandler.getDashboard(c));
nonAdminApp.get('/api/v1/admin/customers', (c) => adminHandler.listCustomers(c));

beforeAll(async () => {
  await seedShop();
  await seedAdmin();

  // Clean up test artifacts that may have been left from a previous run
  await db.delete(schema.products).where(eq(schema.products.slug, 'admin-test-product'));
  await db.delete(schema.customers).where(eq(schema.customers.email, 'test.customer.admin@example.com'));
});

describe('Admin Endpoints', () => {
  // =========================================================================
  // Authorization
  // =========================================================================

  describe('Authorization', () => {
    it('should return 403 for non-admin on products', async () => {
      const res = await nonAdminApp.request('/api/v1/admin/products');
      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
    });

    it('should return 403 for non-admin on dashboard', async () => {
      const res = await nonAdminApp.request('/api/v1/admin/dashboard');
      expect(res.status).toBe(403);
    });

    it('should return 403 for non-admin on customers', async () => {
      const res = await nonAdminApp.request('/api/v1/admin/customers');
      expect(res.status).toBe(403);
    });
  });

  // =========================================================================
  // Products CRUD
  // =========================================================================

  describe('Products CRUD', () => {
    let createdProductId: string;

    it('should create a product', async () => {
      const res = await adminApp.request('/api/v1/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Admin Test Product',
          slug: 'admin-test-product',
          price: 1999,
          description: 'A test product created by admin',
          stockQuantity: 100,
          status: 'active',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.name).toBe('Admin Test Product');
      expect(data.price).toBe(1999);
      createdProductId = data.id;
    });

    it('should update a product', async () => {
      const res = await adminApp.request(`/api/v1/admin/products/${createdProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated Admin Product', price: 2999 }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Updated Admin Product');
      expect(body.data.price).toBe(2999);
    });

    it('should delete a product', async () => {
      const res = await adminApp.request(`/api/v1/admin/products/${createdProductId}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.message).toBe('Product deleted');
    });

    it('should return 404 when deleting nonexistent product', async () => {
      const res = await adminApp.request('/api/v1/admin/products/nonexistent-id', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
    });
  });

  // =========================================================================
  // Dashboard
  // =========================================================================

  describe('Dashboard', () => {
    it('should return dashboard stats', async () => {
      const res = await adminApp.request('/api/v1/admin/dashboard');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.monthlyRevenue).toBeDefined();
      expect(data.nbNewOrders).toBeDefined();
      expect(data.newCustomers).toBeDefined();
      expect(data.pendingOrders).toBeDefined();
      expect(data.pendingReviews).toBeDefined();
      expect(data.orderChart).toBeArray();
      expect(data.orderChart.length).toBe(6);
    });
  });

  // =========================================================================
  // Analytics
  // =========================================================================

  describe('Analytics', () => {
    it('should return revenue analytics', async () => {
      const res = await adminApp.request('/api/v1/admin/analytics/revenue');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.totalRevenue).toBeDefined();
      expect(data.revenueByMonth).toBeArray();
    });

    it('should return top products', async () => {
      const res = await adminApp.request('/api/v1/admin/analytics/top-products');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
    });
  });

  // =========================================================================
  // Inventory
  // =========================================================================

  describe('Inventory', () => {
    it('should list inventory', async () => {
      const res = await adminApp.request('/api/v1/admin/inventory');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].stockQuantity).toBeDefined();
    });

    it('should update stock', async () => {
      const products = await db.select().from(schema.products).limit(1);
      const productId = products[0].id;

      const res = await adminApp.request(`/api/v1/admin/inventory/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockQuantity: 999 }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.stockQuantity).toBe(999);
    });
  });

  // =========================================================================
  // Customers CRUD
  // =========================================================================

  describe('Customers CRUD', () => {
    let createdCustomerId: string;

    it('should list customers', async () => {
      const res = await adminApp.request('/api/v1/admin/customers');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.meta).toBeDefined();
    });

    it('should create a customer', async () => {
      const res = await adminApp.request('/api/v1/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test.customer.admin@example.com',
          segment: 'regular',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.firstName).toBe('Test');
      expect(data.lastName).toBe('Customer');
      createdCustomerId = data.id;
    });

    it('should get customer detail', async () => {
      const res = await adminApp.request(`/api/v1/admin/customers/${createdCustomerId}`);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.id).toBe(createdCustomerId);
      expect(data.email).toBe('test.customer.admin@example.com');
    });

    it('should update a customer', async () => {
      const res = await adminApp.request(`/api/v1/admin/customers/${createdCustomerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'Updated', segment: 'compulsive' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.firstName).toBe('Updated');
      expect(data.segment).toBe('compulsive');
    });

    it('should delete a customer', async () => {
      const res = await adminApp.request(`/api/v1/admin/customers/${createdCustomerId}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);
    });

    it('should filter customers by segment', async () => {
      const res = await adminApp.request('/api/v1/admin/customers?segment=compulsive');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      for (const c of body.data) {
        expect(c.segment).toBe('compulsive');
      }
    });
  });

  // =========================================================================
  // Reviews
  // =========================================================================

  describe('Reviews', () => {
    it('should list reviews', async () => {
      const res = await adminApp.request('/api/v1/admin/reviews');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.meta).toBeDefined();
    });

    it('should filter reviews by status', async () => {
      const res = await adminApp.request('/api/v1/admin/reviews?status=pending');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      for (const r of body.data) {
        expect(r.status).toBe('pending');
      }
    });

    it('should get review detail', async () => {
      const reviews = await db.select().from(schema.reviews).limit(1);
      const reviewId = reviews[0].id;

      const res = await adminApp.request(`/api/v1/admin/reviews/${reviewId}`);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.id).toBe(reviewId);
      expect(data.rating).toBeDefined();
    });

    it('should update a review', async () => {
      const reviews = await db.select().from(schema.reviews).limit(1);
      const reviewId = reviews[0].id;

      const res = await adminApp.request(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('approved');
    });

    it('should bulk approve reviews', async () => {
      const pendingReviews = await db
        .select()
        .from(schema.reviews)
        .where(eq(schema.reviews.status, 'pending'))
        .limit(2);

      if (pendingReviews.length === 0) {
        // Reset some reviews to pending for this test
        const allReviews = await db.select().from(schema.reviews).limit(2);
        for (const r of allReviews) {
          await db.update(schema.reviews).set({ status: 'pending' }).where(eq(schema.reviews.id, r.id));
        }
        const freshPending = await db.select().from(schema.reviews).where(eq(schema.reviews.status, 'pending')).limit(2);
        const ids = freshPending.map((r) => r.id);

        const res = await adminApp.request('/api/v1/admin/reviews/bulk-approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.data.updated).toBe(ids.length);
      } else {
        const ids = pendingReviews.map((r) => r.id);

        const res = await adminApp.request('/api/v1/admin/reviews/bulk-approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids }),
        });

        expect(res.status).toBe(200);
        const body = await res.json();
        expect(body.success).toBe(true);
        expect(body.data.updated).toBe(ids.length);
      }
    });

    it('should bulk reject reviews', async () => {
      // Reset a couple reviews to pending first
      const allReviews = await db.select().from(schema.reviews).limit(2);
      for (const r of allReviews) {
        await db.update(schema.reviews).set({ status: 'pending' }).where(eq(schema.reviews.id, r.id));
      }

      const ids = allReviews.map((r) => r.id);

      const res = await adminApp.request('/api/v1/admin/reviews/bulk-reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.updated).toBe(ids.length);
    });
  });

  // =========================================================================
  // Segments
  // =========================================================================

  describe('Segments', () => {
    it('should list segments with customer count', async () => {
      const res = await adminApp.request('/api/v1/admin/segments');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(4);

      const compulsive = body.data.find((s: { slug: string }) => s.slug === 'compulsive');
      expect(compulsive).toBeDefined();
      expect(compulsive.customerCount).toBeGreaterThan(0);
    });
  });
});
