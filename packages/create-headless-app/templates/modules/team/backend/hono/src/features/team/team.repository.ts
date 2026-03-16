/**
 * Team repository — team member queries extracted from saas.repository.ts
 *
 * These functions are also available in the full saas.repository.ts included
 * with the billing module. Use this standalone file if you only need team
 * management without billing features.
 */

import { eq, and, sql } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

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
