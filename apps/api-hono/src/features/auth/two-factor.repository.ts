/**
 * Two-factor authentication repository — Drizzle queries for totp_secrets
 */

import { eq } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

type TotpRecord = typeof schema.totpSecrets.$inferSelect;

// =========================================================================
// Read
// =========================================================================

/**
 * Find the TOTP record for a user (null if none exists)
 */
export async function findByUserId(userId: string): Promise<TotpRecord | null> {
  const result = await db.query.totpSecrets.findFirst({
    where: eq(schema.totpSecrets.userId, userId),
  });
  return result ?? null;
}

// =========================================================================
// Write
// =========================================================================

/**
 * Upsert TOTP secret for a user (create or replace)
 */
export async function upsertSecret(data: {
  userId: string;
  secret: string;
  enabled?: boolean;
  backupCodes?: string[];
}): Promise<TotpRecord> {
  const now = new Date().toISOString();
  const backupCodesJson = JSON.stringify(data.backupCodes ?? []);

  await db
    .insert(schema.totpSecrets)
    .values({
      userId: data.userId,
      secret: data.secret,
      enabled: data.enabled ?? false,
      backupCodes: backupCodesJson,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.totpSecrets.userId,
      set: {
        secret: data.secret,
        enabled: data.enabled ?? false,
        backupCodes: backupCodesJson,
        updatedAt: now,
      },
    });

  const record = await findByUserId(data.userId);
  if (!record) throw new Error('Failed to upsert TOTP secret');
  return record;
}

/**
 * Enable 2FA for a user and store hashed backup codes
 */
export async function enable(userId: string, hashedBackupCodes: string[]): Promise<TotpRecord> {
  const now = new Date().toISOString();

  await db
    .update(schema.totpSecrets)
    .set({
      enabled: true,
      backupCodes: JSON.stringify(hashedBackupCodes),
      updatedAt: now,
    })
    .where(eq(schema.totpSecrets.userId, userId));

  const record = await findByUserId(userId);
  if (!record) throw new Error('TOTP record not found after enable');
  return record;
}

/**
 * Disable 2FA for a user and wipe stored codes
 */
export async function disable(userId: string): Promise<void> {
  const now = new Date().toISOString();

  await db
    .update(schema.totpSecrets)
    .set({
      enabled: false,
      backupCodes: '[]',
      updatedAt: now,
    })
    .where(eq(schema.totpSecrets.userId, userId));
}

/**
 * Replace the backup codes list (after one is consumed)
 */
export async function updateBackupCodes(
  userId: string,
  hashedCodes: string[]
): Promise<void> {
  const now = new Date().toISOString();

  await db
    .update(schema.totpSecrets)
    .set({
      backupCodes: JSON.stringify(hashedCodes),
      updatedAt: now,
    })
    .where(eq(schema.totpSecrets.userId, userId));
}
