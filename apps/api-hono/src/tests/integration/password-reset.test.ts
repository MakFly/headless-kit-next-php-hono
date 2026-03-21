/**
 * Integration tests for password reset endpoints
 */

import { describe, it, expect } from 'bun:test';
import { zValidator } from '@hono/zod-validator';
import * as authHandlers from '../../features/auth/auth.handlers.ts';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyResetTokenSchema,
} from '../../features/auth/auth.schemas.ts';
import { apiError } from '../../shared/lib/response.ts';
import { createTestApp } from '../helpers/test-app.ts';

const API_VERSION = process.env.API_VERSION || 'v1';
const AUTH_BASE = `/api/${API_VERSION}/auth`;

function createPasswordResetApp() {
  const app = createTestApp();

  app.post(
    `${AUTH_BASE}/password/forgot`,
    zValidator('json', forgotPasswordSchema, (result, c) => {
      if (!result.success) {
        return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
      }
    }),
    async (c) => {
      const data = c.req.valid('json');
      return authHandlers.forgotPassword(c, data);
    }
  );

  app.post(
    `${AUTH_BASE}/password/verify-token`,
    zValidator('json', verifyResetTokenSchema, (result, c) => {
      if (!result.success) {
        return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
      }
    }),
    async (c) => {
      const data = c.req.valid('json');
      return authHandlers.verifyResetToken(c, data);
    }
  );

  app.post(
    `${AUTH_BASE}/password/reset`,
    zValidator('json', resetPasswordSchema, (result, c) => {
      if (!result.success) {
        return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
      }
    }),
    async (c) => {
      const data = c.req.valid('json');
      return authHandlers.resetPassword(c, data);
    }
  );

  return app;
}

describe('Password Reset Endpoints', () => {
  const app = createPasswordResetApp();

  describe('POST /password/forgot', () => {
    it('should return 200 for a known email (email-enumeration safe)', async () => {
      const res = await app.request(`${AUTH_BASE}/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@test.com' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { success: boolean; data: { message: string } };
      expect(body.success).toBe(true);
      expect(body.data.message).toContain('If an account exists');
    });

    it('should return 200 for an unknown email (email-enumeration safe)', async () => {
      const res = await app.request(`${AUTH_BASE}/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nobody@nowhere.example' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { success: boolean; data: { message: string } };
      expect(body.success).toBe(true);
      expect(body.data.message).toContain('If an account exists');
    });

    it('should return 400 for an invalid email', async () => {
      const res = await app.request(`${AUTH_BASE}/password/forgot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json() as { success: boolean; error: { code: string } };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /password/verify-token', () => {
    it('should return valid: false for an invalid token', async () => {
      const res = await app.request(`${AUTH_BASE}/password/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'invalidtoken000' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as { success: boolean; data: { valid: boolean } };
      expect(body.success).toBe(true);
      expect(body.data.valid).toBe(false);
    });

    it('should return 400 for missing token', async () => {
      const res = await app.request(`${AUTH_BASE}/password/verify-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }),
      });

      expect(res.status).toBe(400);
    });
  });

  describe('POST /password/reset', () => {
    it('should return 400 for an invalid token', async () => {
      const res = await app.request(`${AUTH_BASE}/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'badtoken', newPassword: 'NewPass1234!' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json() as { success: boolean; error: { code: string } };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_TOKEN');
    });

    it('should return 400 for a too-short password', async () => {
      const res = await app.request(`${AUTH_BASE}/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: 'sometoken', newPassword: 'short' }),
      });

      expect(res.status).toBe(400);
      const body = await res.json() as { success: boolean; error: { code: string } };
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
