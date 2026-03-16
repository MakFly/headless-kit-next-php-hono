/**
 * Org handlers
 *
 * Handles multi-org management: listing, creating, and inspecting organizations.
 * Org-scoped handlers read `org` from context (set by orgRbac middleware).
 */

import type { Context } from 'hono';
import * as saasService from '../saas/saas.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';
import { requireUser } from '../../shared/middleware/index.ts';
import type { AppVariables } from '../../shared/types/index.ts';

/**
 * GET /orgs
 * Returns all organizations the authenticated user belongs to, with their role.
 */
export async function listOrgs(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const orgs = await saasService.listUserOrgs(user.id);
  return apiSuccess(c, orgs);
}

/**
 * POST /orgs
 * Creates a new organization. The caller becomes the owner.
 */
export async function createOrg(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const body = await c.req.json<{ name?: string; slug?: string }>();

  const { name, slug } = body;
  if (!name || !slug) {
    throw new AppError('name and slug are required', 'VALIDATION_ERROR', 400);
  }

  const org = await saasService.createOrg(user.id, name, slug);
  return apiSuccess(c, org, undefined, 201);
}

/**
 * GET /orgs/:orgId
 * Returns org details. The org is already in context (set by orgRbac middleware).
 */
export async function showOrg(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org');
  const membership = c.get('orgMembership');

  return apiSuccess(c, {
    ...org,
    currentUserRole: membership?.role ?? null,
  });
}
