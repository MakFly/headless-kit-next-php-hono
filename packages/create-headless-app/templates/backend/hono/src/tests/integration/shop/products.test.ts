/**
 * Integration tests for shop endpoints
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import shopRoutes from '../../../features/shop/shop.routes.ts';
import { seedShop } from '../../../shared/db/seeders/shop.seed.ts';
import { createTestApp } from '../../helpers/test-app.ts';

const app = createTestApp();
app.route('/api/v1', shopRoutes);

beforeAll(async () => {
  await seedShop();
});

describe('Shop Endpoints', () => {
  describe('GET /api/v1/products', () => {
    it('should return paginated product list', async () => {
      const res = await app.request('/api/v1/products');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.meta).toBeDefined();
      expect(body.meta.page).toBe(1);
      expect(body.meta.per_page).toBe(12);
      expect(body.meta.total).toBeGreaterThan(0);
      expect(body.meta.total_pages).toBeGreaterThan(0);
    });

    it('should filter by category', async () => {
      const res = await app.request('/api/v1/products?category=electronics');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThan(0);

      for (const product of body.data) {
        expect(product.category?.slug).toBe('electronics');
      }
    });

    it('should search by name', async () => {
      const res = await app.request('/api/v1/products?search=Laptop');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.data[0].name.toLowerCase()).toContain('laptop');
    });

    it('should sort by price ascending', async () => {
      const res = await app.request('/api/v1/products?sort=price_asc');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeArray();

      for (let i = 1; i < body.data.length; i++) {
        expect(body.data[i].price).toBeGreaterThanOrEqual(body.data[i - 1].price);
      }
    });

    it('should filter by price range', async () => {
      const res = await app.request('/api/v1/products?min_price=1000&max_price=5000');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.data).toBeArray();

      for (const product of body.data) {
        expect(product.price).toBeGreaterThanOrEqual(1000);
        expect(product.price).toBeLessThanOrEqual(5000);
      }
    });
  });

  describe('GET /api/v1/products/:slug', () => {
    it('should return product detail', async () => {
      const res = await app.request('/api/v1/products/wireless-nc-headphones');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.id).toBeDefined();
      expect(data.name).toBe('Wireless Noise-Cancelling Headphones');
      expect(data.slug).toBe('wireless-nc-headphones');
      expect(data.price).toBe(29999);
      expect(data.category).toBeDefined();
      expect(data.category?.slug).toBe('electronics');
    });

    it('should return 404 for nonexistent product', async () => {
      const res = await app.request('/api/v1/products/nonexistent-product-xyz');

      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('GET /api/v1/categories', () => {
    it('should return list of categories', async () => {
      const res = await app.request('/api/v1/categories');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(8);

      const electronics = body.data.find((c: { slug: string }) => c.slug === 'electronics');
      expect(electronics).toBeDefined();
      expect(electronics.productCount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/categories/:slug', () => {
    it('should return category with products', async () => {
      const res = await app.request('/api/v1/categories/electronics');

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.name).toBe('Electronics');
      expect(data.slug).toBe('electronics');
      expect(data.products).toBeArray();
      expect(data.products.length).toBeGreaterThan(0);
    });

    it('should return 404 for nonexistent category', async () => {
      const res = await app.request('/api/v1/categories/nonexistent-category');

      expect(res.status).toBe(404);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NOT_FOUND');
    });
  });
});
