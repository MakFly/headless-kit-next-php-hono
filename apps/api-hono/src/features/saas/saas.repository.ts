/**
 * SaaS repository
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

// =========================================================================
// Plans
// =========================================================================

export async function findAllPlans() {
  return db.select().from(schema.plans);
}

export async function findPlanById(id: string) {
  return db.query.plans.findFirst({
    where: eq(schema.plans.id, id),
  }) ?? null;
}

export async function findPlanBySlug(slug: string) {
  return db.query.plans.findFirst({
    where: eq(schema.plans.slug, slug),
  }) ?? null;
}

// =========================================================================
// Organizations
// =========================================================================

export async function createOrganization(data: {
  name: string;
  slug: string;
  ownerId: string;
  planId?: string;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.organizations).values({
    id,
    name: data.name,
    slug: data.slug,
    ownerId: data.ownerId,
    planId: data.planId || null,
    createdAt: now,
    updatedAt: now,
  });

  // Add owner as owner member
  await db.insert(schema.teamMembers).values({
    id: crypto.randomUUID(),
    organizationId: id,
    userId: data.ownerId,
    role: 'owner',
    joinedAt: now,
  });

  return findOrganizationById(id);
}

export async function findOrganizationById(id: string) {
  return db.query.organizations.findFirst({
    where: eq(schema.organizations.id, id),
  }) ?? null;
}

export async function findOrganizationBySlug(slug: string) {
  return db.query.organizations.findFirst({
    where: eq(schema.organizations.slug, slug),
  }) ?? null;
}

export async function findOrganizationByOwnerId(ownerId: string) {
  return db.query.organizations.findFirst({
    where: eq(schema.organizations.ownerId, ownerId),
  }) ?? null;
}

export async function findOrgByUserId(userId: string) {
  // Prefer org where user is owner, fallback to first membership
  const owned = await db.query.organizations.findFirst({
    where: eq(schema.organizations.ownerId, userId),
  });
  if (owned) return owned;

  const membership = await db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.userId, userId),
  });

  if (!membership) return null;
  return findOrganizationById(membership.organizationId);
}

export async function findOrgsByUserId(userId: string) {
  const memberships = await db
    .select({
      orgId: schema.teamMembers.organizationId,
      role: schema.teamMembers.role,
      joinedAt: schema.teamMembers.joinedAt,
    })
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.userId, userId));

  const results = await Promise.all(
    memberships.map(async (m) => {
      const org = await findOrganizationById(m.orgId);
      if (!org) return null;
      return { ...org, role: m.role, joinedAt: m.joinedAt };
    })
  );

  return results.filter((r): r is NonNullable<typeof r> => r !== null);
}

export async function updateOrganization(id: string, data: Partial<{
  name: string;
  slug: string;
  planId: string | null;
}>) {
  await db
    .update(schema.organizations)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.organizations.id, id));

  return findOrganizationById(id);
}

// =========================================================================
// Subscriptions
// =========================================================================

export async function createSubscription(data: {
  organizationId: string;
  planId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}) {
  const id = crypto.randomUUID();

  await db.insert(schema.subscriptions).values({
    id,
    organizationId: data.organizationId,
    planId: data.planId,
    status: 'active',
    currentPeriodStart: data.currentPeriodStart,
    currentPeriodEnd: data.currentPeriodEnd,
    createdAt: new Date().toISOString(),
  });

  return findSubscriptionWithPlan(id);
}

export async function findActiveSubscription(organizationId: string) {
  const result = await db
    .select({
      id: schema.subscriptions.id,
      organizationId: schema.subscriptions.organizationId,
      planId: schema.subscriptions.planId,
      status: schema.subscriptions.status,
      currentPeriodStart: schema.subscriptions.currentPeriodStart,
      currentPeriodEnd: schema.subscriptions.currentPeriodEnd,
      createdAt: schema.subscriptions.createdAt,
      planName: schema.plans.name,
      planSlug: schema.plans.slug,
      planPriceMonthly: schema.plans.priceMonthly,
      planPriceYearly: schema.plans.priceYearly,
      planFeatures: schema.plans.features,
      planLimits: schema.plans.limits,
    })
    .from(schema.subscriptions)
    .innerJoin(schema.plans, eq(schema.subscriptions.planId, schema.plans.id))
    .where(and(
      eq(schema.subscriptions.organizationId, organizationId),
      eq(schema.subscriptions.status, 'active')
    ))
    .limit(1);

  return result[0] ?? null;
}

export async function findSubscriptionWithPlan(id: string) {
  const result = await db
    .select({
      id: schema.subscriptions.id,
      organizationId: schema.subscriptions.organizationId,
      planId: schema.subscriptions.planId,
      status: schema.subscriptions.status,
      currentPeriodStart: schema.subscriptions.currentPeriodStart,
      currentPeriodEnd: schema.subscriptions.currentPeriodEnd,
      createdAt: schema.subscriptions.createdAt,
      planName: schema.plans.name,
      planSlug: schema.plans.slug,
    })
    .from(schema.subscriptions)
    .innerJoin(schema.plans, eq(schema.subscriptions.planId, schema.plans.id))
    .where(eq(schema.subscriptions.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function cancelSubscription(id: string) {
  await db
    .update(schema.subscriptions)
    .set({ status: 'cancelled' })
    .where(eq(schema.subscriptions.id, id));

  return findSubscriptionWithPlan(id);
}

// =========================================================================
// Invoices
// =========================================================================

export async function createInvoice(data: {
  organizationId: string;
  amount: number;
  status?: string;
  periodStart: string;
  periodEnd: string;
  paidAt?: string;
}) {
  const id = crypto.randomUUID();

  await db.insert(schema.invoices).values({
    id,
    organizationId: data.organizationId,
    amount: data.amount,
    status: data.status || 'pending',
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    paidAt: data.paidAt || null,
    createdAt: new Date().toISOString(),
  });

  return db.query.invoices.findFirst({ where: eq(schema.invoices.id, id) });
}

export async function findInvoicesByOrgId(organizationId: string) {
  return db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.organizationId, organizationId))
    .orderBy(desc(schema.invoices.createdAt));
}

// =========================================================================
// Team Members
// =========================================================================

export async function findTeamMembers(organizationId: string) {
  return db
    .select({
      id: schema.teamMembers.id,
      userId: schema.teamMembers.userId,
      role: schema.teamMembers.role,
      joinedAt: schema.teamMembers.joinedAt,
      userName: schema.users.name,
      userEmail: schema.users.email,
      userAvatarUrl: schema.users.avatarUrl,
    })
    .from(schema.teamMembers)
    .innerJoin(schema.users, eq(schema.teamMembers.userId, schema.users.id))
    .where(eq(schema.teamMembers.organizationId, organizationId));
}

export async function findTeamMemberById(id: string) {
  return db.query.teamMembers.findFirst({
    where: eq(schema.teamMembers.id, id),
  }) ?? null;
}

export async function findTeamMemberByEmail(organizationId: string, email: string) {
  const result = await db
    .select({
      id: schema.teamMembers.id,
      userId: schema.teamMembers.userId,
      role: schema.teamMembers.role,
    })
    .from(schema.teamMembers)
    .innerJoin(schema.users, eq(schema.teamMembers.userId, schema.users.id))
    .where(and(
      eq(schema.teamMembers.organizationId, organizationId),
      eq(schema.users.email, email)
    ))
    .limit(1);

  return result[0] ?? null;
}

export async function findTeamMemberByUserId(organizationId: string, userId: string) {
  return db.query.teamMembers.findFirst({
    where: and(
      eq(schema.teamMembers.organizationId, organizationId),
      eq(schema.teamMembers.userId, userId)
    ),
  }) ?? null;
}

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email),
  }) ?? null;
}

export async function addTeamMember(organizationId: string, userId: string, role = 'member') {
  const id = crypto.randomUUID();

  await db.insert(schema.teamMembers).values({
    id,
    organizationId,
    userId,
    role,
    joinedAt: new Date().toISOString(),
  });

  return db.query.teamMembers.findFirst({ where: eq(schema.teamMembers.id, id) });
}

export async function updateTeamMemberRole(id: string, role: string) {
  await db
    .update(schema.teamMembers)
    .set({ role })
    .where(eq(schema.teamMembers.id, id));

  return db.query.teamMembers.findFirst({ where: eq(schema.teamMembers.id, id) });
}

export async function removeTeamMember(id: string) {
  const existing = await findTeamMemberById(id);
  if (!existing) return false;

  await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id));
  return true;
}

export async function countTeamMembers(organizationId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.organizationId, organizationId));

  return result.count;
}

// =========================================================================
// Usage Records
// =========================================================================

export async function findUsageRecords(organizationId: string) {
  return db
    .select()
    .from(schema.usageRecords)
    .where(eq(schema.usageRecords.organizationId, organizationId))
    .orderBy(desc(schema.usageRecords.recordedAt));
}

export async function createUsageRecord(data: {
  organizationId: string;
  metric: string;
  value: number;
  limitValue: number;
}) {
  const id = crypto.randomUUID();

  await db.insert(schema.usageRecords).values({
    id,
    organizationId: data.organizationId,
    metric: data.metric,
    value: data.value,
    limitValue: data.limitValue,
    recordedAt: new Date().toISOString(),
  });

  return db.query.usageRecords.findFirst({ where: eq(schema.usageRecords.id, id) });
}

// =========================================================================
// Dashboard
// =========================================================================

export async function getDashboardStats(organizationId: string) {
  const [membersResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.organizationId, organizationId));

  // Get latest usage records per metric
  const usageRows = await db
    .select()
    .from(schema.usageRecords)
    .where(eq(schema.usageRecords.organizationId, organizationId))
    .orderBy(desc(schema.usageRecords.recordedAt));

  const latestByMetric: Record<string, { value: number; limitValue: number }> = {};
  for (const row of usageRows) {
    if (!latestByMetric[row.metric]) {
      latestByMetric[row.metric] = { value: row.value, limitValue: row.limitValue };
    }
  }

  const sub = await findActiveSubscription(organizationId);

  return {
    activeMembers: membersResult.count,
    totalProjects: latestByMetric.projects?.value ?? 0,
    apiCallsThisMonth: latestByMetric.api_calls?.value ?? 0,
    storageUsed: latestByMetric.storage?.value ?? 0,
    currentPlan: sub ? sub.planName : null,
  };
}
