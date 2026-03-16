/**
 * Authentication middleware
 */

import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import { verifyToken } from '../lib/jwt.ts';
import { AppError } from '../lib/errors.ts';
import { apiError } from '../lib/response.ts';
import { t } from '../lib/i18n/index.ts';
import type { AppVariables, SafeUser, JwtPayload } from '../types/index.ts';
import { eq } from 'drizzle-orm';
import { db, schema } from '../db/index.ts';

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Auth middleware - requires authentication
 */
export const authMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const locale = c.get('locale') ?? 'en';
    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return apiError(c, 'UNAUTHORIZED', t(locale, 'common.unauthorized'), 401);
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return apiError(c, 'UNAUTHORIZED', t(locale, 'common.unauthorized'), 401);
    }

    const result = await db.query.users.findFirst({
      where: eq(schema.users.id, payload.sub),
    });

    if (!result) {
      return apiError(c, 'UNAUTHORIZED', t(locale, 'common.unauthorized'), 401);
    }

    const user: SafeUser = {
      id: result.id,
      email: result.email,
      name: result.name,
      emailVerifiedAt: result.emailVerifiedAt,
      avatarUrl: result.avatarUrl,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };

    c.set('user', user);
    c.set('jwtPayload', payload);

    await next();
  }
);

/**
 * Optional auth middleware - doesn't require authentication but parses token if present
 */
export const optionalAuthMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    c.set('user', null);
    c.set('jwtPayload', null);

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const result = await db.query.users.findFirst({
          where: eq(schema.users.id, payload.sub),
        });
        if (result) {
          const user: SafeUser = {
            id: result.id,
            email: result.email,
            name: result.name,
            emailVerifiedAt: result.emailVerifiedAt,
            avatarUrl: result.avatarUrl,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
          };
          c.set('user', user);
          c.set('jwtPayload', payload);
        }
      }
    }

    await next();
  }
);

/**
 * Get current user from context
 */
export function getUser(c: Context<{ Variables: AppVariables }>): SafeUser | null {
  return c.get('user');
}

/**
 * Get JWT payload from context
 */
export function getJwtPayload(c: Context<{ Variables: AppVariables }>): JwtPayload | null {
  return c.get('jwtPayload');
}

/**
 * Require user to be authenticated (throws AppError if not)
 */
export function requireUser(c: Context<{ Variables: AppVariables }>): SafeUser {
  const user = c.get('user');
  if (!user) {
    throw new AppError('Unauthorized', 'UNAUTHORIZED', 401);
  }
  return user;
}
