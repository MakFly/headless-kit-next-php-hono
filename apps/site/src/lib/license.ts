import { db } from "./db"
import { licenses } from "../db/schema"
import { generateLicenseKey } from "../db/utils"
import { eq, and } from "drizzle-orm"
import type { PlanTier } from "./stripe"

export async function createLicense(opts: {
  userId: string
  tier: PlanTier
  stripeSessionId: string
  stripeCustomerId?: string
}) {
  const licenseKey = generateLicenseKey()
  const expiresAt = opts.tier === "pro"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    : null // business = lifetime

  const [license] = await db.insert(licenses).values({
    userId: opts.userId,
    tier: opts.tier,
    licenseKey,
    stripeSessionId: opts.stripeSessionId,
    stripeCustomerId: opts.stripeCustomerId,
    expiresAt,
  }).returning()

  return license
}

export async function getLicenseByUser(userId: string) {
  const results = await db.select().from(licenses)
    .where(and(eq(licenses.userId, userId), eq(licenses.active, true)))
    .orderBy(licenses.createdAt)
    .limit(1)
  return results[0] || null
}

export async function getAllLicenses() {
  return db.select().from(licenses).orderBy(licenses.createdAt)
}

export async function revokeLicense(licenseId: string) {
  await db.update(licenses)
    .set({ active: false })
    .where(eq(licenses.id, licenseId))
}

export async function reactivateLicense(licenseId: string) {
  await db.update(licenses)
    .set({ active: true })
    .where(eq(licenses.id, licenseId))
}

export async function extendLicense(licenseId: string, months: number) {
  const [existing] = await db.select().from(licenses).where(eq(licenses.id, licenseId)).limit(1)
  if (!existing) return

  const base = existing.expiresAt ? new Date(existing.expiresAt) : new Date()
  base.setMonth(base.getMonth() + months)

  await db.update(licenses)
    .set({ expiresAt: base, active: true })
    .where(eq(licenses.id, licenseId))
}

export async function createManualLicense(opts: {
  userId: string
  tier: PlanTier
  expiresAt?: Date | null
}) {
  const licenseKey = generateLicenseKey()
  const expiresAt = opts.expiresAt !== undefined
    ? opts.expiresAt
    : opts.tier === "pro"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : null

  const [license] = await db.insert(licenses).values({
    userId: opts.userId,
    tier: opts.tier,
    licenseKey,
    expiresAt,
  }).returning()

  return license
}
