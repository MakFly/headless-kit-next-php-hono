import { d as db, l as licenses, g as generateLicenseKey } from './db_CHRX6QwF.mjs';
import { and, eq } from 'drizzle-orm';

async function getLicenseByUser(userId) {
  const results = await db.select().from(licenses).where(and(eq(licenses.userId, userId), eq(licenses.active, true))).orderBy(licenses.createdAt).limit(1);
  return results[0] || null;
}
async function revokeLicense(licenseId) {
  await db.update(licenses).set({ active: false }).where(eq(licenses.id, licenseId));
}
async function reactivateLicense(licenseId) {
  await db.update(licenses).set({ active: true }).where(eq(licenses.id, licenseId));
}
async function extendLicense(licenseId, months) {
  const [existing] = await db.select().from(licenses).where(eq(licenses.id, licenseId)).limit(1);
  if (!existing) return;
  const base = existing.expiresAt ? new Date(existing.expiresAt) : /* @__PURE__ */ new Date();
  base.setMonth(base.getMonth() + months);
  await db.update(licenses).set({ expiresAt: base, active: true }).where(eq(licenses.id, licenseId));
}
async function createManualLicense(opts) {
  const licenseKey = generateLicenseKey();
  const expiresAt = opts.expiresAt !== void 0 ? opts.expiresAt : opts.tier === "pro" ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1e3) : null;
  const [license] = await db.insert(licenses).values({
    userId: opts.userId,
    tier: opts.tier,
    licenseKey,
    expiresAt
  }).returning();
  return license;
}

export { revokeLicense as a, createManualLicense as c, extendLicense as e, getLicenseByUser as g, reactivateLicense as r };
