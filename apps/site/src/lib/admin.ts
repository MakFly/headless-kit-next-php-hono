import { db } from "./db"
import { user, session, licenses } from "../db/schema"
import { eq, ilike, or, and, sql, desc, lt, count } from "drizzle-orm"

// ── User Management ──

export async function updateUserRole(userId: string, newRole: string) {
  await db.update(user).set({ role: newRole, updatedAt: new Date() }).where(eq(user.id, userId))
}

export async function deleteUser(userId: string) {
  // Cascade: sessions + accounts are CASCADE in DB, licenses we handle manually
  await db.update(licenses).set({ active: false }).where(eq(licenses.userId, userId))
  await db.delete(user).where(eq(user.id, userId))
}

export async function getUserById(userId: string) {
  const results = await db.select().from(user).where(eq(user.id, userId)).limit(1)
  return results[0] || null
}

export async function getUserWithLicense(userId: string) {
  const u = await getUserById(userId)
  if (!u) return null

  const userLicenses = await db.select().from(licenses)
    .where(eq(licenses.userId, userId))
    .orderBy(desc(licenses.createdAt))

  return { ...u, licenses: userLicenses }
}

export type UserFilter = {
  role?: string
}

export async function searchUsers(query: string, filters: UserFilter, page: number, perPage = 20) {
  const conditions = []

  if (query) {
    conditions.push(or(
      ilike(user.name, `%${query}%`),
      ilike(user.email, `%${query}%`)
    ))
  }

  if (filters.role && filters.role !== "all") {
    conditions.push(eq(user.role, filters.role))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [users, totalResult] = await Promise.all([
    db.select().from(user)
      .where(where)
      .orderBy(desc(user.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ count: count() }).from(user).where(where),
  ])

  const total = totalResult[0]?.count ?? 0

  return {
    users,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  }
}

// ── License Search ──

export type LicenseFilter = {
  tier?: string
  status?: string // "active" | "revoked" | "expired"
}

export async function searchLicenses(query: string, filters: LicenseFilter, page: number, perPage = 20) {
  const conditions = []

  if (query) {
    conditions.push(or(
      ilike(licenses.licenseKey, `%${query}%`),
      // Subquery to match user email
      sql`${licenses.userId} IN (SELECT id FROM "user" WHERE email ILIKE ${`%${query}%`})`
    ))
  }

  if (filters.tier && filters.tier !== "all") {
    conditions.push(eq(licenses.tier, filters.tier as "pro" | "business"))
  }

  if (filters.status === "active") {
    conditions.push(and(
      eq(licenses.active, true),
      or(sql`${licenses.expiresAt} IS NULL`, sql`${licenses.expiresAt} > NOW()`)
    ))
  } else if (filters.status === "revoked") {
    conditions.push(eq(licenses.active, false))
  } else if (filters.status === "expired") {
    conditions.push(and(
      eq(licenses.active, true),
      sql`${licenses.expiresAt} IS NOT NULL AND ${licenses.expiresAt} <= NOW()`
    ))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [items, totalResult] = await Promise.all([
    db.select().from(licenses)
      .where(where)
      .orderBy(desc(licenses.createdAt))
      .limit(perPage)
      .offset((page - 1) * perPage),
    db.select({ count: count() }).from(licenses).where(where),
  ])

  const total = totalResult[0]?.count ?? 0

  return {
    licenses: items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  }
}

// ── Activity & Stats ──

export async function getRecentSignups(limit = 5) {
  return db.select().from(user).orderBy(desc(user.createdAt)).limit(limit)
}

export async function getExpiringLicenses(days = 30) {
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return db.select().from(licenses)
    .where(and(
      eq(licenses.active, true),
      sql`${licenses.expiresAt} IS NOT NULL`,
      lt(licenses.expiresAt, cutoff)
    ))
    .orderBy(licenses.expiresAt)
}

export async function getRecentLicenses(limit = 5) {
  return db.select().from(licenses).orderBy(desc(licenses.createdAt)).limit(limit)
}

export async function getStats() {
  const [usersCount] = await db.select({ count: count() }).from(user)
  const [licensesCount] = await db.select({ count: count() }).from(licenses)
  const [activeCount] = await db.select({ count: count() }).from(licenses)
    .where(eq(licenses.active, true))
  const [proCount] = await db.select({ count: count() }).from(licenses)
    .where(and(eq(licenses.tier, "pro"), eq(licenses.active, true)))
  const [businessCount] = await db.select({ count: count() }).from(licenses)
    .where(and(eq(licenses.tier, "business"), eq(licenses.active, true)))

  const revenue = (proCount.count * 79) + (businessCount.count * 199)

  return {
    totalUsers: usersCount.count,
    totalLicenses: licensesCount.count,
    activeLicenses: activeCount.count,
    proLicenses: proCount.count,
    businessLicenses: businessCount.count,
    revenue,
  }
}

// ── Session Management ──

export async function getUserSessions(userId: string) {
  return db.select().from(session)
    .where(eq(session.userId, userId))
    .orderBy(desc(session.createdAt))
}

export async function killSession(sessionId: string) {
  await db.delete(session).where(eq(session.id, sessionId))
}

export async function killAllSessions() {
  await db.delete(session)
}

// ── User email lookup (for license creation) ──

export async function getUserByEmail(email: string) {
  const results = await db.select().from(user).where(eq(user.email, email)).limit(1)
  return results[0] || null
}
