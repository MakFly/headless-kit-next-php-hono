/**
 * Password reset service
 */

import { createHash } from 'crypto';
import * as passwordResetRepository from './password-reset.repository.ts';
import * as authRepository from './auth.repository.ts';
import { hashPassword } from '../../shared/lib/index.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { db, schema } from '../../shared/db/index.ts';
import { eq } from 'drizzle-orm';

const TOKEN_TTL_HOURS = 1;

/**
 * Hash a raw token with SHA-256 for safe storage
 */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Generate a cryptographically secure random token
 */
function generateToken(): string {
  // 32 bytes → 64 hex chars
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Initiate password reset — always returns success (email-enumeration safe).
 * Logs the reset link to console in dev mode.
 */
export async function forgotPassword(email: string): Promise<void> {
  const user = await authRepository.findByEmail(email);

  // Always silently succeed regardless of whether the email exists
  if (!user) {
    return;
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000);

  await passwordResetRepository.createResetToken({
    email: email.toLowerCase(),
    tokenHash,
    expiresAt,
  });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:{{FRONTEND_PORT}}';
  const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`;

  // In production, send an email here. For now, log to console.
  console.log('[password-reset] Reset link for', email, ':', resetLink);
}

/**
 * Verify a reset token — returns { valid, email } without consuming it.
 */
export async function verifyToken(
  rawToken: string
): Promise<{ valid: true; email: string } | { valid: false }> {
  const tokenHash = hashToken(rawToken);
  const entry = await passwordResetRepository.findByTokenHash(tokenHash);

  if (!entry) {
    return { valid: false };
  }

  const now = new Date().toISOString();
  if (entry.expiresAt < now) {
    // Clean up expired token
    await passwordResetRepository.deleteByTokenHash(tokenHash);
    return { valid: false };
  }

  return { valid: true, email: entry.email };
}

/**
 * Reset a user's password using a valid token.
 * Consumes the token after use.
 */
export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const entry = await passwordResetRepository.findByTokenHash(tokenHash);

  if (!entry) {
    throw new AppError('Invalid or expired reset token', 'INVALID_TOKEN', 400);
  }

  const now = new Date().toISOString();
  if (entry.expiresAt < now) {
    await passwordResetRepository.deleteByTokenHash(tokenHash);
    throw new AppError('Reset token has expired', 'TOKEN_EXPIRED', 400);
  }

  const user = await authRepository.findByEmail(entry.email);
  if (!user) {
    // Token exists but user was deleted — clean up silently
    await passwordResetRepository.deleteByTokenHash(tokenHash);
    throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  }

  const passwordHash = await hashPassword(newPassword);

  await db
    .update(schema.users)
    .set({ passwordHash, updatedAt: new Date().toISOString() })
    .where(eq(schema.users.id, user.id));

  // Consume the token
  await passwordResetRepository.deleteByTokenHash(tokenHash);
}
