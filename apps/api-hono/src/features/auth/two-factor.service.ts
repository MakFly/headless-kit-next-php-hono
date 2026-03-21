/**
 * Two-factor authentication service — TOTP + backup codes business logic
 */

import { TOTP, Secret } from 'otpauth';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import * as twoFactorRepository from './two-factor.repository.ts';
import * as authRepository from './auth.repository.ts';
import {
  generateAccessToken,
  generateRefreshToken,
  getAccessTokenExpiration,
  getRefreshTokenExpirationDate,
} from '../../shared/lib/index.ts';
import { AppError } from '../../shared/lib/errors.ts';
import type { AuthResponse, SafeUser } from '../../shared/types/index.ts';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ISSUER = 'HeadlessKit';
const BACKUP_CODE_COUNT = 10;

const TEMP_TOKEN_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'dev-secret'
);
// Short-lived temp token: 10 minutes
const TEMP_TOKEN_TTL_SECONDS = 10 * 60;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Build a TOTP instance for a given email + base32 secret
 */
function buildTotp(email: string, secretBase32: string): TOTP {
  return new TOTP({
    issuer: ISSUER,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(secretBase32),
  });
}

/**
 * Hash a raw backup code with SHA-256 (hex)
 */
async function hashBackupCode(raw: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(raw)
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate N random backup codes in XXXXX-XXXXX format
 */
function generateRawBackupCodes(): string[] {
  const codes: string[] = [];
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // unambiguous charset
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const randomBytes = crypto.getRandomValues(new Uint8Array(10));
    let code = '';
    for (let j = 0; j < 10; j++) {
      code += chars[randomBytes[j] % chars.length];
      if (j === 4) code += '-';
    }
    codes.push(code);
  }
  return codes;
}

// ---------------------------------------------------------------------------
// Temp token (semi-authenticated state while 2FA pending)
// ---------------------------------------------------------------------------

/**
 * Sign a short-lived temp JWT that only allows hitting /2fa/verify or /2fa/recovery.
 * Carries `sub` (userId) and `type: "2fa_pending"`.
 */
export async function signTempToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ type: '2fa_pending' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + TEMP_TOKEN_TTL_SECONDS)
    .sign(TEMP_TOKEN_SECRET);
}

/**
 * Verify a temp token; returns userId or null
 */
export async function verifyTempToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, TEMP_TOKEN_SECRET, {
      algorithms: ['HS256'],
    });
    if ((payload as JWTPayload & { type?: string }).type !== '2fa_pending') {
      return null;
    }
    return payload.sub as string;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return whether 2FA is enabled for a user
 */
export async function getStatus(userId: string): Promise<{ enabled: boolean }> {
  const record = await twoFactorRepository.findByUserId(userId);
  return { enabled: record?.enabled ?? false };
}

/**
 * Generate a new TOTP secret + QR code URI + raw backup codes.
 * Does NOT enable 2FA yet — caller must confirm with a valid code via enable().
 * Stores the secret in the DB with enabled=false.
 */
export async function setup(
  userId: string,
  userEmail: string
): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
  const totp = new TOTP({
    issuer: ISSUER,
    label: userEmail,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  const secretBase32 = totp.secret.base32;
  const qrCode = totp.toString();
  const rawBackupCodes = generateRawBackupCodes();

  // Persist secret (not yet enabled) — overwrite any previous pending setup
  await twoFactorRepository.upsertSecret({
    userId,
    secret: secretBase32,
    enabled: false,
    backupCodes: [],
  });

  return { secret: secretBase32, qrCode, backupCodes: rawBackupCodes };
}

/**
 * Verify the TOTP code and activate 2FA. Returns the final backup codes.
 * The raw backup codes are passed in because they were generated during setup()
 * and never persisted in plaintext.
 *
 * IMPORTANT: the caller must provide `rawBackupCodes` from the setup() response.
 * If they are not provided, fresh ones are generated (lost-codes recovery path).
 */
export async function enableTwoFactor(
  userId: string,
  userEmail: string,
  code: string
): Promise<{ enabled: true; backupCodes: string[] }> {
  const record = await twoFactorRepository.findByUserId(userId);
  if (!record) {
    throw new AppError('2FA setup not initiated. Call /2fa/setup first.', 'TWO_FA_NOT_SETUP', 400);
  }
  if (record.enabled) {
    throw new AppError('2FA is already enabled', 'TWO_FA_ALREADY_ENABLED', 409);
  }

  const totp = buildTotp(userEmail, record.secret);
  const valid = totp.validate({ token: code, window: 1 }) !== null;
  if (!valid) {
    throw new AppError('Invalid 2FA code', 'INVALID_2FA_CODE', 422);
  }

  // Generate fresh backup codes to return to the user
  const rawBackupCodes = generateRawBackupCodes();
  const hashedCodes = await Promise.all(rawBackupCodes.map(hashBackupCode));

  await twoFactorRepository.enable(userId, hashedCodes);

  return { enabled: true, backupCodes: rawBackupCodes };
}

/**
 * Complete a pending 2FA login using a TOTP code.
 * Accepts a `tempToken` issued by the login flow.
 * Returns a full AuthResponse on success.
 */
export async function verifyLogin(
  tempToken: string,
  code: string
): Promise<AuthResponse> {
  const userId = await verifyTempToken(tempToken);
  if (!userId) {
    throw new AppError('Invalid or expired temporary token', 'INVALID_TEMP_TOKEN', 401);
  }

  const userWithRoles = await authRepository.findWithRoles(userId);
  if (!userWithRoles) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 401);
  }

  const record = await twoFactorRepository.findByUserId(userId);
  if (!record || !record.enabled) {
    throw new AppError('2FA is not enabled for this user', 'TWO_FA_NOT_ENABLED', 400);
  }

  const totp = buildTotp(userWithRoles.email, record.secret);
  const valid = totp.validate({ token: code, window: 1 }) !== null;
  if (!valid) {
    throw new AppError('Invalid 2FA code', 'INVALID_2FA_CODE', 422);
  }

  return _issueTokens(userWithRoles);
}

/**
 * Disable 2FA. Requires a valid TOTP code.
 */
export async function disableTwoFactor(
  userId: string,
  userEmail: string,
  code: string
): Promise<{ enabled: false }> {
  const record = await twoFactorRepository.findByUserId(userId);
  if (!record || !record.enabled) {
    throw new AppError('2FA is not enabled', 'TWO_FA_NOT_ENABLED', 400);
  }

  const totp = buildTotp(userEmail, record.secret);
  const valid = totp.validate({ token: code, window: 1 }) !== null;
  if (!valid) {
    throw new AppError('Invalid 2FA code', 'INVALID_2FA_CODE', 422);
  }

  await twoFactorRepository.disable(userId);
  return { enabled: false };
}

/**
 * Complete a pending 2FA login using a backup recovery code.
 * The code is consumed (deleted) on success.
 */
export async function verifyRecovery(
  tempToken: string,
  rawCode: string
): Promise<AuthResponse> {
  const userId = await verifyTempToken(tempToken);
  if (!userId) {
    throw new AppError('Invalid or expired temporary token', 'INVALID_TEMP_TOKEN', 401);
  }

  const userWithRoles = await authRepository.findWithRoles(userId);
  if (!userWithRoles) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 401);
  }

  const record = await twoFactorRepository.findByUserId(userId);
  if (!record || !record.enabled) {
    throw new AppError('2FA is not enabled for this user', 'TWO_FA_NOT_ENABLED', 400);
  }

  const hashedInput = await hashBackupCode(rawCode.toUpperCase());
  const storedCodes: string[] = JSON.parse(record.backupCodes);

  const matchIndex = storedCodes.indexOf(hashedInput);
  if (matchIndex === -1) {
    throw new AppError('Invalid recovery code', 'INVALID_RECOVERY_CODE', 422);
  }

  // Consume the code (remove from list — single use)
  const remaining = storedCodes.filter((_, i) => i !== matchIndex);
  await twoFactorRepository.updateBackupCodes(userId, remaining);

  return _issueTokens(userWithRoles);
}

/**
 * Return the current (hashed) backup codes count — used to show how many remain.
 * We never return raw codes after setup, only the count.
 */
export async function getRecoveryCodes(
  userId: string
): Promise<{ codes: string[]; remaining: number }> {
  const record = await twoFactorRepository.findByUserId(userId);
  if (!record || !record.enabled) {
    throw new AppError('2FA is not enabled', 'TWO_FA_NOT_ENABLED', 400);
  }

  const stored: string[] = JSON.parse(record.backupCodes);
  // Return masked codes (show remaining count, not actual hashed values)
  const masked = stored.map((_, i) => `CODE-${String(i + 1).padStart(2, '0')}`);
  return { codes: masked, remaining: stored.length };
}

// ---------------------------------------------------------------------------
// Internal
// ---------------------------------------------------------------------------

async function _issueTokens(
  userWithRoles: SafeUser & { roles?: import('../../shared/types/index.ts').Role[] }
): Promise<AuthResponse> {
  const accessToken = await generateAccessToken(userWithRoles);
  const refreshToken = await generateRefreshToken(userWithRoles.id);

  await authRepository.createToken({
    userId: userWithRoles.id,
    token: refreshToken,
    expiresAt: getRefreshTokenExpirationDate(),
  });

  return {
    user: userWithRoles,
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenExpiration(),
    tokenType: 'Bearer',
  };
}
