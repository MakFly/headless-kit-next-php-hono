/**
 * Password reset token repository
 */

import { eq } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

/**
 * Create a password reset token entry (replaces any existing one for the same email)
 */
export async function createResetToken(data: {
  email: string;
  tokenHash: string;
  expiresAt: Date;
}): Promise<void> {
  // Delete any existing token for this email first (one active token per email)
  await db
    .delete(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.email, data.email.toLowerCase()));

  await db.insert(schema.passwordResetTokens).values({
    email: data.email.toLowerCase(),
    tokenHash: data.tokenHash,
    expiresAt: data.expiresAt.toISOString(),
  });
}

/**
 * Find a reset token entry by its hash
 */
export async function findByTokenHash(tokenHash: string): Promise<{
  id: number;
  email: string;
  tokenHash: string;
  expiresAt: string;
  createdAt: string | null;
} | null> {
  const result = await db.query.passwordResetTokens.findFirst({
    where: eq(schema.passwordResetTokens.tokenHash, tokenHash),
  });

  return result ?? null;
}

/**
 * Delete a reset token by its hash (after use)
 */
export async function deleteByTokenHash(tokenHash: string): Promise<void> {
  await db
    .delete(schema.passwordResetTokens)
    .where(eq(schema.passwordResetTokens.tokenHash, tokenHash));
}

/**
 * Delete all expired reset tokens (cleanup)
 */
export async function deleteExpired(): Promise<void> {
  const now = new Date().toISOString();

  const all = await db.query.passwordResetTokens.findMany();
  for (const entry of all) {
    if (entry.expiresAt < now) {
      await db
        .delete(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.id, entry.id));
    }
  }
}
