/**
 * Integration tests for auth endpoints
 */

import { describe, it, expect } from 'bun:test';
import { zValidator } from '@hono/zod-validator';
import * as authHandlers from '../../features/auth/auth.handlers.ts';
import { loginSchema, registerSchema, refreshSchema } from '../../features/auth/auth.schemas.ts';
import { authMiddleware } from '../../shared/middleware/index.ts';
import { apiError } from '../../shared/lib/response.ts';
import { createTestApp } from '../helpers/test-app.ts';

// API version from environment (matches server config)
const API_VERSION = process.env.API_VERSION || 'v1';
const AUTH_BASE = `/api/${API_VERSION}/auth`;

// Create a test app instance
function createAuthTestApp() {
  const app = createTestApp();

  // Register route
  app.post(
    `${AUTH_BASE}/register`,
    zValidator('json', registerSchema, (result, c) => {
      if (!result.success) {
        return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
      }
    }),
    async (c) => {
      const data = c.req.valid('json');
      return authHandlers.register(c, data);
    }
  );

  // Login route
  app.post(
    `${AUTH_BASE}/login`,
    zValidator('json', loginSchema, (result, c) => {
      if (!result.success) {
        return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
      }
    }),
    async (c) => {
      const data = c.req.valid('json');
      return authHandlers.login(c, data);
    }
  );

  // Me route
  app.get(`${AUTH_BASE}/me`, authMiddleware, async (c) => {
    return authHandlers.me(c);
  });

  // Refresh route
  app.post(
    `${AUTH_BASE}/refresh`,
    zValidator('json', refreshSchema, (result, c) => {
      if (!result.success) {
        return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
      }
    }),
    async (c) => {
      const data = c.req.valid('json');
      return authHandlers.refresh(c, data);
    }
  );

  // Logout route
  app.post(`${AUTH_BASE}/logout`, authMiddleware, async (c) => {
    return authHandlers.logout(c);
  });

  // OAuth providers (SSO: Google, GitHub, Apple, Microsoft, etc.)
  app.get(`${AUTH_BASE}/oauth/providers`, async (c) => {
    return authHandlers.getOAuthProviders(c);
  });

  return app;
}

describe('Auth API Integration Tests', () => {
  const app = createAuthTestApp();
  const testEmail = `test-${Date.now()}@example.com`;
  let accessToken: string;
  let refreshToken: string;

  describe(`POST ${AUTH_BASE}/register`, () => {
    it('should register a new user', async () => {
      const res = await app.request(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: testEmail,
          password: 'securePassword123',
        }),
      });

      expect(res.status).toBe(201);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.name).toBe('Test User');
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.expiresIn).toBeDefined();
      expect(data.tokenType).toBe('Bearer');

      // Also check snake_case aliases
      expect(data.access_token).toBe(data.accessToken);
      expect(data.refresh_token).toBe(data.refreshToken);
    });

    it('should reject duplicate email', async () => {
      const res = await app.request(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Another User',
          email: testEmail,
          password: 'anotherPassword123',
        }),
      });

      expect(res.status).toBe(409);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain('Email');
    });

    it('should reject invalid data', async () => {
      const res = await app.request(`${AUTH_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A', // Too short
          email: 'invalid',
          password: '123', // Too short
        }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe(`POST ${AUTH_BASE}/login`, () => {
    it('should login with valid credentials', async () => {
      const res = await app.request(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'securePassword123',
        }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.user).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();

      // Store tokens for subsequent tests
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    });

    it('should reject invalid password', async () => {
      const res = await app.request(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'wrongPassword',
        }),
      });

      expect(res.status).toBe(401);

      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.message).toContain('Invalid');
    });

    it('should reject non-existent email', async () => {
      const res = await app.request(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'somePassword',
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe(`GET ${AUTH_BASE}/me`, () => {
    it('should return current user with valid token', async () => {
      const res = await app.request(`${AUTH_BASE}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.email).toBe(testEmail);
      expect(data.name).toBe('Test User');
      expect(data.roles).toBeDefined();
    });

    it('should reject request without token', async () => {
      const res = await app.request(`${AUTH_BASE}/me`, {
        method: 'GET',
      });

      expect(res.status).toBe(401);
    });

    it('should reject invalid token', async () => {
      const res = await app.request(`${AUTH_BASE}/me`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      });

      expect(res.status).toBe(401);
    });
  });

  describe(`POST ${AUTH_BASE}/refresh`, () => {
    it('should refresh tokens with valid refresh token', async () => {
      const res = await app.request(`${AUTH_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshToken,
        }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      const data = body.data;
      expect(data.accessToken).toBeDefined();
      expect(data.refreshToken).toBeDefined();
      expect(data.user).toBeDefined();

      // Update tokens for subsequent tests
      accessToken = data.accessToken;
      refreshToken = data.refreshToken;
    });

    it('should accept snake_case refresh_token', async () => {
      // First, login to get a fresh token
      const loginRes = await app.request(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'securePassword123',
        }),
      });
      const loginBody = await loginRes.json();
      const loginData = loginBody.data;

      const res = await app.request(`${AUTH_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: loginData.refreshToken,
        }),
      });

      expect(res.status).toBe(200);
    });

    it('should reject invalid refresh token', async () => {
      const res = await app.request(`${AUTH_BASE}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: 'invalid-refresh-token',
        }),
      });

      expect(res.status).toBe(401);
    });
  });

  describe(`POST ${AUTH_BASE}/logout`, () => {
    it('should logout with valid token', async () => {
      // First login to get fresh tokens
      const loginRes = await app.request(`${AUTH_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testEmail,
          password: 'securePassword123',
        }),
      });
      const loginBody = await loginRes.json();
      const loginData = loginBody.data;

      const res = await app.request(`${AUTH_BASE}/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${loginData.accessToken}`,
        },
        body: JSON.stringify({
          refreshToken: loginData.refreshToken,
        }),
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.message).toContain('success');
    });

    it('should reject logout without auth', async () => {
      const res = await app.request(`${AUTH_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(res.status).toBe(401);
    });
  });

  describe(`GET ${AUTH_BASE}/oauth/providers`, () => {
    it('should return empty providers list (SSO not configured)', async () => {
      const res = await app.request(`${AUTH_BASE}/oauth/providers`, {
        method: 'GET',
      });

      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.providers).toBeDefined();
      expect(Array.isArray(body.data.providers)).toBe(true);
      // Empty until OAuth providers (Google, GitHub, etc.) are configured
    });
  });
});
