/**
 * Admin middleware - requires admin role
 */

import { createMiddleware } from 'hono/factory';
import { eq, and } from 'drizzle-orm';
import { db, schema } from '../db/index.ts';
import { apiError } from '../lib/response.ts';
import { t } from '../lib/i18n/index.ts';
import type { AppVariables } from '../types/index.ts';

/**
 * Check if user has admin role
 */
async function isAdmin(userId: string): Promise<boolean> {
  const adminRole = await db.query.roles.findFirst({
    where: eq(schema.roles.slug, 'admin'),
  });

  if (!adminRole) return false;

  const userRole = await db.query.userRoles.findFirst({
    where: and(
      eq(schema.userRoles.userId, userId),
      eq(schema.userRoles.roleId, adminRole.id)
    ),
  });

  return !!userRole;
}

/**
 * Admin middleware - requires user to have admin role
 */
export const adminMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const user = c.get('user');
    const locale = c.get('locale') ?? 'en';

    if (!user) {
      return apiError(c, 'UNAUTHORIZED', t(locale, 'common.unauthorized'), 401);
    }

    const admin = await isAdmin(user.id);
    if (!admin) {
      return apiError(c, 'FORBIDDEN', t(locale, 'common.forbidden'), 403);
    }

    await next();
  }
);
