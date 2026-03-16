/**
 * Org RBAC middleware
 *
 * Verifies the authenticated user is a member of the target org
 * and has at least the required role level.
 *
 * Sets `org` and `orgMembership` in Hono context for downstream handlers.
 */

import type { MiddlewareHandler } from 'hono';
import * as saasRepository from '../../features/org/org.repository.ts';
import { apiError } from '../lib/response.ts';
import { t } from '../lib/i18n/index.ts';
import type { AppVariables } from '../types/index.ts';

export type OrgRole = 'owner' | 'admin' | 'member' | 'viewer';

export const ROLE_HIERARCHY: Record<OrgRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  viewer: 1,
};

export function orgRbac(minRole: OrgRole): MiddlewareHandler<{ Variables: AppVariables }> {
  return async (c, next) => {
    const user = c.get('user');
    const locale = c.get('locale') ?? 'en';

    if (!user) {
      return apiError(c, 'UNAUTHORIZED', t(locale, 'common.unauthorized'), 401);
    }

    const orgId = c.req.param('orgId');
    if (!orgId) {
      return apiError(c, 'ORG_ID_REQUIRED', t(locale, 'saas.org_id_required'), 400);
    }

    const org = await saasRepository.findOrganizationById(orgId);
    if (!org) {
      return apiError(c, 'ORG_NOT_FOUND', t(locale, 'saas.org_not_found'), 404);
    }

    const membership = await saasRepository.findTeamMemberByUserId(orgId, user.id);
    if (!membership) {
      return apiError(c, 'NOT_A_MEMBER', t(locale, 'saas.not_a_member'), 403);
    }

    const userLevel = ROLE_HIERARCHY[membership.role as OrgRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      return apiError(c, 'INSUFFICIENT_PERMISSIONS', t(locale, 'saas.insufficient_permissions'), 403);
    }

    c.set('org', org);
    c.set('orgMembership', membership);

    await next();
  };
}
