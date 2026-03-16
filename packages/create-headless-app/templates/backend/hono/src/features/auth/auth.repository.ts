/**
 * Auth repository — merges user and token repositories
 */

import { eq, lt } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';
import type { User, SafeUser, Role, RefreshToken } from '../../shared/types/index.ts';
import { nanoid } from 'nanoid';

// =========================================================================
// User repository
// =========================================================================

/**
 * Convert database user to SafeUser
 */
function toSafeUser(user: typeof schema.users.$inferSelect): SafeUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerifiedAt: user.emailVerifiedAt,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Find user by ID
 */
export async function findById(id: string): Promise<SafeUser | null> {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
  });

  return result ? toSafeUser(result) : null;
}

/**
 * Find user by email
 */
export async function findByEmail(email: string): Promise<User | null> {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.email, email.toLowerCase()),
  });

  if (!result) return null;

  return {
    id: result.id,
    email: result.email,
    name: result.name,
    passwordHash: result.passwordHash,
    emailVerifiedAt: result.emailVerifiedAt,
    avatarUrl: result.avatarUrl,
    createdAt: result.createdAt,
    updatedAt: result.updatedAt,
  };
}

/**
 * Find user with roles
 */
export async function findWithRoles(id: string): Promise<(SafeUser & { roles: Role[] }) | null> {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.id, id),
    with: {
      userRoles: {
        with: {
          role: true,
        },
      },
    },
  });

  if (!result) return null;

  const roles: Role[] = result.userRoles.map((ur) => ({
    id: ur.role.id,
    name: ur.role.name,
    slug: ur.role.slug,
    description: ur.role.description,
    createdAt: ur.role.createdAt,
    updatedAt: ur.role.updatedAt,
  }));

  return {
    ...toSafeUser(result),
    roles,
  };
}

/**
 * Create a new user
 */
export async function createUser(data: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<SafeUser> {
  const id = nanoid();
  const now = new Date().toISOString();

  await db.insert(schema.users).values({
    id,
    email: data.email.toLowerCase(),
    name: data.name,
    passwordHash: data.passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  // Assign default "user" role
  const userRole = await db.query.roles.findFirst({
    where: eq(schema.roles.slug, 'user'),
  });

  if (userRole) {
    await db.insert(schema.userRoles).values({
      userId: id,
      roleId: userRole.id,
    });
  }

  const user = await findById(id);
  if (!user) throw new Error('Failed to create user');

  return user;
}

/**
 * Check if email exists
 */
export async function emailExists(email: string): Promise<boolean> {
  const result = await db.query.users.findFirst({
    where: eq(schema.users.email, email.toLowerCase()),
    columns: { id: true },
  });

  return !!result;
}

// =========================================================================
// Token repository
// =========================================================================

/**
 * Create a refresh token
 */
export async function createToken(data: {
  userId: string;
  token: string;
  expiresAt: Date;
}): Promise<RefreshToken> {
  const id = nanoid();
  const now = new Date().toISOString();

  await db.insert(schema.refreshTokens).values({
    id,
    userId: data.userId,
    token: data.token,
    expiresAt: data.expiresAt.toISOString(),
    createdAt: now,
  });

  return {
    id,
    userId: data.userId,
    token: data.token,
    expiresAt: data.expiresAt.toISOString(),
    createdAt: now,
  };
}

/**
 * Find refresh token by token value
 */
export async function findTokenByValue(token: string): Promise<RefreshToken | null> {
  const result = await db.query.refreshTokens.findFirst({
    where: eq(schema.refreshTokens.token, token),
  });

  if (!result) return null;

  return {
    id: result.id,
    userId: result.userId,
    token: result.token,
    expiresAt: result.expiresAt,
    createdAt: result.createdAt,
  };
}

/**
 * Delete refresh token by token value
 */
export async function deleteTokenByValue(token: string): Promise<boolean> {
  const existing = await findTokenByValue(token);
  if (!existing) return false;

  await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.token, token));

  return true;
}

/**
 * Delete all refresh tokens for a user
 */
export async function deleteTokensByUserId(userId: string): Promise<void> {
  await db.delete(schema.refreshTokens).where(eq(schema.refreshTokens.userId, userId));
}

/**
 * Check if token is valid (exists and not expired)
 */
export async function isTokenValid(token: string): Promise<boolean> {
  const now = new Date().toISOString();

  const result = await db.query.refreshTokens.findFirst({
    where: eq(schema.refreshTokens.token, token),
  });

  if (!result) return false;

  return result.expiresAt > now;
}
