/**
 * Auth routes
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema, registerSchema, refreshSchema } from './auth.schemas.ts';
import * as authHandlers from './auth.handlers.ts';
import { authMiddleware, noStoreMiddleware, rateLimitMiddleware } from '../../shared/middleware/index.ts';
import { apiError } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

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
      return apiError(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        400,
        result.error.flatten().fieldErrors
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return authHandlers.register(c, data);
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
      return apiError(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        400,
        result.error.flatten().fieldErrors
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return authHandlers.login(c, data);
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
      return apiError(
        c,
        'VALIDATION_ERROR',
        'Validation failed',
        400,
        result.error.flatten().fieldErrors
      );
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return authHandlers.refresh(c, data);
  }
);

/**
 * POST /api/auth/logout
 * Logout user (requires authentication)
 */
auth.post('/logout', authMiddleware, async (c) => {
  return authHandlers.logout(c);
});

/**
 * GET /api/auth/me
 * Get current user (requires authentication)
 */
auth.get('/me', authMiddleware, async (c) => {
  return authHandlers.me(c);
});

/**
 * GET /api/auth/sessions
 * Get active sessions for the authenticated user
 */
auth.get('/sessions', authMiddleware, async (c) => {
  return authHandlers.sessions(c);
});

/**
 * GET /api/auth/oauth/providers
 * Get available OAuth providers
 */
auth.get('/oauth/providers', async (c) => {
  return authHandlers.getOAuthProviders(c);
});

/**
 * GET /api/auth/test-accounts
 * Get test accounts for development (returns empty in production)
 */
auth.get('/test-accounts', async (c) => {
  if (process.env.NODE_ENV === 'production') {
    return c.json({ success: true, data: [], status: 200 });
  }

  return c.json({
    success: true,
    data: [
      { email: 'admin@example.com', name: 'Admin User', password: 'Admin1234!', role: 'admin' },
      { email: 'test@test.com', name: 'Test User', password: 'Test1234!', role: 'user' },
      { email: 'refresh-test@example.com', name: 'Refresh Test User', password: 'Refresh1234!', role: 'user' },
    ],
    status: 200,
  });
});

export default auth;
