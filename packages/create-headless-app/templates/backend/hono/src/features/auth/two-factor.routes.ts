/**
 * Two-factor authentication routes
 * Mounted at /api/v1/auth/2fa/*
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import {
  twoFactorEnableSchema,
  twoFactorVerifySchema,
  twoFactorDisableSchema,
  twoFactorRecoverySchema,
} from './two-factor.schemas.ts';
import * as twoFactorHandlers from './two-factor.handlers.ts';
import { authMiddleware, noStoreMiddleware, rateLimitMiddleware } from '../../shared/middleware/index.ts';
import { apiError } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const twoFactor = new Hono<{ Variables: AppVariables }>();

twoFactor.use('*', noStoreMiddleware);

// ---------------------------------------------------------------------------
// Authenticated routes (require full access token)
// ---------------------------------------------------------------------------

/**
 * GET /2fa/status
 * Returns whether 2FA is enabled for the current user.
 */
twoFactor.get('/status', authMiddleware, async (c) => {
  return twoFactorHandlers.getStatus(c);
});

/**
 * POST /2fa/setup
 * Generate TOTP secret + QR code URI + raw backup codes.
 * 2FA is NOT active yet — must confirm with /enable.
 */
twoFactor.post('/setup', authMiddleware, async (c) => {
  return twoFactorHandlers.setup(c);
});

/**
 * POST /2fa/enable
 * Confirm TOTP code and activate 2FA.
 */
twoFactor.post(
  '/enable',
  authMiddleware,
  zValidator('json', twoFactorEnableSchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return twoFactorHandlers.enable(c, data);
  }
);

/**
 * POST /2fa/disable
 * Disable 2FA — requires a valid TOTP code.
 */
twoFactor.post(
  '/disable',
  authMiddleware,
  zValidator('json', twoFactorDisableSchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return twoFactorHandlers.disable(c, data);
  }
);

/**
 * GET /2fa/recovery-codes
 * Return how many backup codes remain (masked list).
 */
twoFactor.get('/recovery-codes', authMiddleware, async (c) => {
  return twoFactorHandlers.getRecoveryCodes(c);
});

// ---------------------------------------------------------------------------
// Semi-authenticated routes (tempToken in Authorization header)
// These do NOT use authMiddleware — the token type is "2fa_pending", not a
// regular access token. The handler validates it internally.
// ---------------------------------------------------------------------------

/**
 * POST /2fa/verify
 * Verify TOTP code to complete login when 2FA is pending.
 */
twoFactor.post(
  '/verify',
  rateLimitMiddleware({ scope: 'auth-2fa-verify', maxAttempts: 10, windowSeconds: 15 * 60 }),
  zValidator('json', twoFactorVerifySchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return twoFactorHandlers.verify(c, data);
  }
);

/**
 * POST /2fa/recovery
 * Use a backup code to complete login when 2FA is pending.
 */
twoFactor.post(
  '/recovery',
  rateLimitMiddleware({ scope: 'auth-2fa-recovery', maxAttempts: 5, windowSeconds: 15 * 60 }),
  zValidator('json', twoFactorRecoverySchema, (result, c) => {
    if (!result.success) {
      return apiError(c, 'VALIDATION_ERROR', 'Validation failed', 400, result.error.flatten().fieldErrors);
    }
  }),
  async (c) => {
    const data = c.req.valid('json');
    return twoFactorHandlers.recovery(c, data);
  }
);

export default twoFactor;
