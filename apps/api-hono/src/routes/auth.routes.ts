/**
 * Auth routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authHandler, loginSchema, registerSchema, refreshSchema } from '../handlers/index.ts';
import { authMiddleware, noStoreMiddleware, rateLimitMiddleware } from '../middleware/index.ts';
import type { AppVariables } from '../types/index.ts';

const auth = new Hono<{ Variables: AppVariables }>();

auth.use('*', noStoreMiddleware);

/**
 * POST /api/auth/register
 * Register a new user
 */
auth.post(
  '/register',
  zValidator('json', registerSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
          status: 400,
          request_id: c.get('requestId'),
        },
        400
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return authHandler.register(c, data);
  }
);

/**
 * POST /api/auth/login
 * Login a user
 */
auth.post(
  '/login',
  rateLimitMiddleware({
    scope: 'auth-login',
    maxAttempts: 5,
    windowSeconds: 15 * 60,
  }),
  zValidator('json', loginSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
          status: 400,
          request_id: c.get('requestId'),
        },
        400
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return authHandler.login(c, data);
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
auth.post(
  '/refresh',
  rateLimitMiddleware({
    scope: 'auth-refresh',
    maxAttempts: 30,
    windowSeconds: 60,
  }),
  zValidator('json', refreshSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: result.error.flatten().fieldErrors,
          status: 400,
          request_id: c.get('requestId'),
        },
        400
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return authHandler.refresh(c, data);
  }
);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
auth.post('/logout', authMiddleware, async (c) => {
  return authHandler.logout(c);
});

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
auth.get('/me', authMiddleware, async (c) => {
  return authHandler.me(c);
});

/**
 * GET /api/auth/oauth/providers
 * Get available OAuth providers
 */
auth.get('/oauth/providers', async (c) => {
  return authHandler.getOAuthProviders(c);
});

export default auth;
