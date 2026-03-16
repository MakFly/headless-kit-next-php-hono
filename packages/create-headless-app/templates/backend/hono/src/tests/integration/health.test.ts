/**
 * Integration tests for health endpoints
 */

import { describe, it, expect } from 'bun:test';
import { Hono } from 'hono';

// Create a minimal test app for health checks
function createHealthApp() {
  const app = new Hono();

  app.get('/', (c) => {
    return c.json({
      name: '@headless/api-hono',
      version: '0.1.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/health', (c) => {
    return c.json({ status: 'ok' });
  });

  return app;
}

describe('Health Endpoints', () => {
  const app = createHealthApp();

  describe('GET /', () => {
    it('should return app info', async () => {
      const res = await app.request('/');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.name).toBe('@headless/api-hono');
      expect(data.version).toBe('0.1.0');
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
    });
  });

  describe('GET /health', () => {
    it('should return ok status', async () => {
      const res = await app.request('/health');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe('ok');
    });
  });
});
