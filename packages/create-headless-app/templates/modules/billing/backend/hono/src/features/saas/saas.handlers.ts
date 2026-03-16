/**
 * SaaS handlers
 *
 * All org-scoped handlers read `org` from context (set by orgRbac middleware).
 */

import type { Context } from 'hono';
import * as saasService from './saas.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

// =========================================================================
// Plans (public — no org context required)
// =========================================================================

export async function listPlans(c: Context<{ Variables: AppVariables }>) {
  const plans = await saasService.listPlans();
  return apiSuccess(c, plans);
}

// =========================================================================
// Dashboard
// =========================================================================

export async function getDashboard(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const dashboard = await saasService.getDashboard(org.id);
  return apiSuccess(c, dashboard);
}

// =========================================================================
// Subscription
// =========================================================================

export async function getSubscription(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const sub = await saasService.getSubscription(org.id);
  return apiSuccess(c, sub);
}

export async function subscribe(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const body = await c.req.json<{ planId?: string }>();

  if (!body.planId) {
    throw new AppError('planId is required', 'VALIDATION_ERROR', 400);
  }

  const sub = await saasService.subscribe(org.id, body.planId);
  return apiSuccess(c, sub, undefined, 201);
}

export async function cancelSubscription(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const sub = await saasService.cancelSubscription(org.id);
  return apiSuccess(c, sub);
}

// =========================================================================
// Invoices
// =========================================================================

export async function listInvoices(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const invoices = await saasService.listInvoices(org.id);
  return apiSuccess(c, invoices);
}

// =========================================================================
// Team
// =========================================================================

export async function listTeamMembers(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const members = await saasService.listTeamMembers(org.id);
  return apiSuccess(c, members);
}

export async function inviteTeamMember(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const body = await c.req.json<{ email?: string; role?: string }>();

  if (!body.email) {
    throw new AppError('email is required', 'VALIDATION_ERROR', 400);
  }

  const member = await saasService.inviteTeamMember(org.id, body.email, body.role ?? 'member');
  return apiSuccess(c, member, undefined, 201);
}

export async function updateTeamMemberRole(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const memberId = c.req.param('id') ?? '';
  const body = await c.req.json<{ role?: string }>();

  if (!body.role) {
    throw new AppError('role is required', 'VALIDATION_ERROR', 400);
  }

  const member = await saasService.updateTeamMemberRole(org.id, memberId, body.role);
  return apiSuccess(c, member);
}

export async function removeTeamMember(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const memberId = c.req.param('id') ?? '';
  await saasService.removeTeamMember(org.id, memberId);
  return apiSuccess(c, { message: 'Member removed' });
}

// =========================================================================
// Usage
// =========================================================================

export async function getUsage(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const usage = await saasService.getUsage(org.id);
  return apiSuccess(c, usage);
}

// =========================================================================
// Settings
// =========================================================================

export async function getSettings(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const settings = await saasService.getSettings(org.id);
  return apiSuccess(c, settings);
}

export async function updateSettings(c: Context<{ Variables: AppVariables }>) {
  const org = c.get('org')!;
  const body = await c.req.json<{ name?: string; slug?: string }>();
  const updated = await saasService.updateSettings(org.id, body);
  return apiSuccess(c, updated);
}
