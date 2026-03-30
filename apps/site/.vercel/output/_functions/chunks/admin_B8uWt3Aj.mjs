import { l as licenses, d as db, u as user, s as session } from './db_CHRX6QwF.mjs';
import { or, ilike, sql, eq, and, desc, count, lt } from 'drizzle-orm';

async function updateUserRole(userId, newRole) {
  await db.update(user).set({ role: newRole, updatedAt: /* @__PURE__ */ new Date() }).where(eq(user.id, userId));
}
async function deleteUser(userId) {
  await db.update(licenses).set({ active: false }).where(eq(licenses.userId, userId));
  await db.delete(user).where(eq(user.id, userId));
}
async function getUserById(userId) {
  const results = await db.select().from(user).where(eq(user.id, userId)).limit(1);
  return results[0] || null;
}
async function getUserWithLicense(userId) {
  const u = await getUserById(userId);
  if (!u) return null;
  const userLicenses = await db.select().from(licenses).where(eq(licenses.userId, userId)).orderBy(desc(licenses.createdAt));
  return { ...u, licenses: userLicenses };
}
async function searchUsers(query, filters, page, perPage = 20) {
  const conditions = [];
  if (query) {
    conditions.push(or(
      ilike(user.name, `%${query}%`),
      ilike(user.email, `%${query}%`)
    ));
  }
  if (filters.role && filters.role !== "all") {
    conditions.push(eq(user.role, filters.role));
  }
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const [users, totalResult] = await Promise.all([
    db.select().from(user).where(where).orderBy(desc(user.createdAt)).limit(perPage).offset((page - 1) * perPage),
    db.select({ count: count() }).from(user).where(where)
  ]);
  const total = totalResult[0]?.count ?? 0;
  return {
    users,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}
async function searchLicenses(query, filters, page, perPage = 20) {
  const conditions = [];
  if (query) {
    conditions.push(or(
      ilike(licenses.licenseKey, `%${query}%`),
      // Subquery to match user email
      sql`${licenses.userId} IN (SELECT id FROM "user" WHERE email ILIKE ${`%${query}%`})`
    ));
  }
  if (filters.tier && filters.tier !== "all") {
    conditions.push(eq(licenses.tier, filters.tier));
  }
  if (filters.status === "active") {
    conditions.push(and(
      eq(licenses.active, true),
      or(sql`${licenses.expiresAt} IS NULL`, sql`${licenses.expiresAt} > NOW()`)
    ));
  } else if (filters.status === "revoked") {
    conditions.push(eq(licenses.active, false));
  } else if (filters.status === "expired") {
    conditions.push(and(
      eq(licenses.active, true),
      sql`${licenses.expiresAt} IS NOT NULL AND ${licenses.expiresAt} <= NOW()`
    ));
  }
  const where = conditions.length > 0 ? and(...conditions) : void 0;
  const [items, totalResult] = await Promise.all([
    db.select().from(licenses).where(where).orderBy(desc(licenses.createdAt)).limit(perPage).offset((page - 1) * perPage),
    db.select({ count: count() }).from(licenses).where(where)
  ]);
  const total = totalResult[0]?.count ?? 0;
  return {
    licenses: items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage)
  };
}
async function getRecentSignups(limit = 5) {
  return db.select().from(user).orderBy(desc(user.createdAt)).limit(limit);
}
async function getExpiringLicenses(days = 30) {
  const cutoff = new Date(Date.now() + days * 24 * 60 * 60 * 1e3);
  return db.select().from(licenses).where(and(
    eq(licenses.active, true),
    sql`${licenses.expiresAt} IS NOT NULL`,
    lt(licenses.expiresAt, cutoff)
  )).orderBy(licenses.expiresAt);
}
async function getRecentLicenses(limit = 5) {
  return db.select().from(licenses).orderBy(desc(licenses.createdAt)).limit(limit);
}
async function getStats() {
  const [usersCount] = await db.select({ count: count() }).from(user);
  const [licensesCount] = await db.select({ count: count() }).from(licenses);
  const [activeCount] = await db.select({ count: count() }).from(licenses).where(eq(licenses.active, true));
  const [proCount] = await db.select({ count: count() }).from(licenses).where(and(eq(licenses.tier, "pro"), eq(licenses.active, true)));
  const [businessCount] = await db.select({ count: count() }).from(licenses).where(and(eq(licenses.tier, "business"), eq(licenses.active, true)));
  const revenue = proCount.count * 79 + businessCount.count * 199;
  return {
    totalUsers: usersCount.count,
    totalLicenses: licensesCount.count,
    activeLicenses: activeCount.count,
    proLicenses: proCount.count,
    businessLicenses: businessCount.count,
    revenue
  };
}
async function getUserSessions(userId) {
  return db.select().from(session).where(eq(session.userId, userId)).orderBy(desc(session.createdAt));
}
async function killSession(sessionId) {
  await db.delete(session).where(eq(session.id, sessionId));
}
async function killAllSessions() {
  await db.delete(session);
}
async function getUserByEmail(email) {
  const results = await db.select().from(user).where(eq(user.email, email)).limit(1);
  return results[0] || null;
}

export { killSession as a, getStats as b, getUserWithLicense as c, deleteUser as d, getUserSessions as e, searchUsers as f, getUserByEmail as g, getRecentSignups as h, getExpiringLicenses as i, getRecentLicenses as j, killAllSessions as k, searchLicenses as s, updateUserRole as u };
