/**
 * Two-factor authentication handlers
 */

import type { Context } from 'hono';
import * as twoFactorService from './two-factor.service.ts';
import { apiSuccess, apiError } from '../../shared/lib/response.ts';
import { requireUser } from '../../shared/middleware/auth.ts';
import type { AppVariables } from '../../shared/types/index.ts';
import type {
  TwoFactorEnableInput,
  TwoFactorVerifyInput,
  TwoFactorDisableInput,
  TwoFactorRecoveryInput,
} from './two-factor.schemas.ts';

type AuthContext = Context<{ Variables: AppVariables }>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract tempToken from the Authorization header (Bearer <token>)
 */
function extractTempToken(c: Context): string | null {
  const header = c.req.header('Authorization');
  if (!header) return null;
  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null;
  return parts[1];
}

/**
 * Format a full auth response (mirrors auth.handlers formatAuthResponse)
 */
function formatAuthResponse(response: Awaited<ReturnType<typeof twoFactorService.verifyLogin>>) {
  return {
    user: {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      emailVerifiedAt: response.user.emailVerifiedAt,
      email_verified_at: response.user.emailVerifiedAt,
      avatarUrl: response.user.avatarUrl,
      avatar_url: response.user.avatarUrl,
      createdAt: response.user.createdAt,
      created_at: response.user.createdAt,
      updatedAt: response.user.updatedAt,
      updated_at: response.user.updatedAt,
      roles: response.user.roles,
    },
    accessToken: response.accessToken,
    access_token: response.accessToken,
    refreshToken: response.refreshToken,
    refresh_token: response.refreshToken,
    expiresIn: response.expiresIn,
    expires_in: response.expiresIn,
    tokenType: response.tokenType,
    token_type: response.tokenType,
  };
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * GET /2fa/status
 * Returns whether 2FA is enabled for the authenticated user.
 */
export async function getStatus(c: AuthContext) {
  const user = requireUser(c);
  const status = await twoFactorService.getStatus(user.id);
  return apiSuccess(c, status);
}

/**
 * POST /2fa/setup
 * Generates a new TOTP secret + QR code + backup codes.
 * 2FA is NOT yet active — user must call /2fa/enable with a valid code.
 */
export async function setup(c: AuthContext) {
  const user = requireUser(c);
  const result = await twoFactorService.setup(user.id, user.email);
  return apiSuccess(c, result);
}

/**
 * POST /2fa/enable
 * Verifies the TOTP code and activates 2FA.
 * Body: { code: "123456" }
 */
export async function enable(c: AuthContext, data: TwoFactorEnableInput) {
  const user = requireUser(c);
  const result = await twoFactorService.enableTwoFactor(user.id, user.email, data.code);
  return apiSuccess(c, result);
}

/**
 * POST /2fa/verify
 * Semi-authenticated endpoint: user has logged in but 2FA is pending.
 * Authorization: Bearer <tempToken>
 * Body: { code: "123456" }
 */
export async function verify(c: Context, data: TwoFactorVerifyInput) {
  const tempToken = extractTempToken(c);
  if (!tempToken) {
    return apiError(c, 'UNAUTHORIZED', 'Temporary token required', 401);
  }

  const authResponse = await twoFactorService.verifyLogin(tempToken, data.code);
  return apiSuccess(c, formatAuthResponse(authResponse));
}

/**
 * POST /2fa/disable
 * Disables 2FA after confirming with a valid TOTP code.
 * Body: { code: "123456" }
 */
export async function disable(c: AuthContext, data: TwoFactorDisableInput) {
  const user = requireUser(c);
  const result = await twoFactorService.disableTwoFactor(user.id, user.email, data.code);
  return apiSuccess(c, result);
}

/**
 * POST /2fa/recovery
 * Semi-authenticated endpoint: recover access with a backup code.
 * Authorization: Bearer <tempToken>
 * Body: { code: "XXXXX-XXXXX" }
 */
export async function recovery(c: Context, data: TwoFactorRecoveryInput) {
  const tempToken = extractTempToken(c);
  if (!tempToken) {
    return apiError(c, 'UNAUTHORIZED', 'Temporary token required', 401);
  }

  const authResponse = await twoFactorService.verifyRecovery(tempToken, data.code);
  return apiSuccess(c, formatAuthResponse(authResponse));
}

/**
 * GET /2fa/recovery-codes
 * Returns how many backup codes remain (masked).
 */
export async function getRecoveryCodes(c: AuthContext) {
  const user = requireUser(c);
  const result = await twoFactorService.getRecoveryCodes(user.id);
  return apiSuccess(c, result);
}
