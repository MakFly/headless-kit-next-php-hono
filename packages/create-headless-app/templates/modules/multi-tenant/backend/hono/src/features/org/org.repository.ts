/**
 * SaaS repository — org/team related queries
 */

import { eq, and, desc, sql } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

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

export async function findTeamMemberByUserId(organizationId: string, userId: string) {
  return db.query.teamMembers.findFirst({
    where: and(
      eq(schema.teamMembers.organizationId, organizationId),
      eq(schema.teamMembers.userId, userId)
    ),
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

export async function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(schema.users.email, email),
  }) ?? null;
}
