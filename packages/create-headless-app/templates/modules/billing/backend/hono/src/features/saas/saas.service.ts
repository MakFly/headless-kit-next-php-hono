/**
 * SaaS service
 */

import * as saasRepository from './saas.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

// Re-export AppError as SaasError for backward compatibility
export { AppError as SaasError };

// =========================================================================
// Plans
// =========================================================================

export async function listPlans() {
  return saasRepository.findAllPlans();
}

// =========================================================================
// Organizations
// =========================================================================

export async function listUserOrgs(userId: string) {
  return saasRepository.findOrgsByUserId(userId);
}

export async function createOrg(userId: string, name: string, slug: string) {
  const existing = await saasRepository.findOrganizationBySlug(slug);
  if (existing) {
    throw new AppError('Slug already taken', 'SLUG_TAKEN', 409);
  }

  const org = await saasRepository.createOrganization({ name, slug, ownerId: userId });
  if (!org) {
    throw new AppError('Failed to create organization', 'ORG_ERROR', 500);
  }
  return org;
}

// =========================================================================
// Dashboard
// =========================================================================

export async function getDashboard(orgId: string) {
  return saasRepository.getDashboardStats(orgId);
}

// =========================================================================
// Subscription
// =========================================================================

export async function getSubscription(orgId: string) {
  const sub = await saasRepository.findActiveSubscription(orgId);
  if (!sub) {
    throw new AppError('No active subscription', 'NO_SUBSCRIPTION', 404);
  }
  return sub;
}

export async function subscribe(orgId: string, planId: string) {
  const plan = await saasRepository.findPlanById(planId);
  if (!plan) {
    throw new AppError('Plan not found', 'PLAN_NOT_FOUND', 404);
  }

  const existing = await saasRepository.findActiveSubscription(orgId);
  if (existing) {
    throw new AppError('Already subscribed', 'ALREADY_SUBSCRIBED', 409);
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const sub = await saasRepository.createSubscription({
    organizationId: orgId,
    planId,
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
  });

  await saasRepository.createInvoice({
    organizationId: orgId,
    amount: plan.priceMonthly,
    status: 'paid',
    periodStart: now.toISOString(),
    periodEnd: periodEnd.toISOString(),
    paidAt: now.toISOString(),
  });

  await saasRepository.updateOrganization(orgId, { planId });

  return sub;
}

export async function cancelSubscription(orgId: string) {
  const sub = await saasRepository.findActiveSubscription(orgId);
  if (!sub) {
    throw new AppError('No active subscription', 'NO_SUBSCRIPTION', 404);
  }

  return saasRepository.cancelSubscription(sub.id);
}

// =========================================================================
// Invoices
// =========================================================================

export async function listInvoices(orgId: string) {
  return saasRepository.findInvoicesByOrgId(orgId);
}

// =========================================================================
// Team
// =========================================================================

export async function listTeamMembers(orgId: string) {
  return saasRepository.findTeamMembers(orgId);
}

export async function inviteTeamMember(orgId: string, email: string, role: string) {
  const existing = await saasRepository.findTeamMemberByEmail(orgId, email);
  if (existing) {
    throw new AppError('User is already a member', 'ALREADY_MEMBER', 409);
  }

  const sub = await saasRepository.findActiveSubscription(orgId);
  if (sub && sub.planLimits) {
    const limits = sub.planLimits as { maxMembers: number };
    const currentCount = await saasRepository.countTeamMembers(orgId);
    if (currentCount >= limits.maxMembers) {
      throw new AppError('Member limit reached for current plan', 'MEMBER_LIMIT_REACHED', 422);
    }
  }

  const targetUser = await saasRepository.findUserByEmail(email);
  if (!targetUser) {
    throw new AppError('User not found with that email', 'USER_NOT_FOUND', 404);
  }

  return saasRepository.addTeamMember(orgId, targetUser.id, role || 'member');
}

export async function updateTeamMemberRole(orgId: string, memberId: string, role: string) {
  const member = await saasRepository.findTeamMemberById(memberId);
  if (!member || member.organizationId !== orgId) {
    throw new AppError('Member not found', 'MEMBER_NOT_FOUND', 404);
  }

  if (member.role === 'owner') {
    throw new AppError('Cannot change owner role', 'CANNOT_CHANGE_OWNER', 403);
  }

  return saasRepository.updateTeamMemberRole(memberId, role);
}

export async function removeTeamMember(orgId: string, memberId: string) {
  const member = await saasRepository.findTeamMemberById(memberId);
  if (!member || member.organizationId !== orgId) {
    throw new AppError('Member not found', 'MEMBER_NOT_FOUND', 404);
  }

  if (member.role === 'owner') {
    throw new AppError('Cannot remove the owner', 'CANNOT_REMOVE_OWNER', 403);
  }

  const removed = await saasRepository.removeTeamMember(memberId);
  if (!removed) {
    throw new AppError('Member not found', 'MEMBER_NOT_FOUND', 404);
  }

  return true;
}

// =========================================================================
// Usage
// =========================================================================

export async function getUsage(orgId: string) {
  return saasRepository.findUsageRecords(orgId);
}

// =========================================================================
// Settings
// =========================================================================

export async function getSettings(orgId: string) {
  const org = await saasRepository.findOrganizationById(orgId);
  if (!org) {
    throw new AppError('Organization not found', 'ORG_NOT_FOUND', 404);
  }
  return { name: org.name, slug: org.slug };
}

export async function updateSettings(orgId: string, data: { name?: string; slug?: string }) {
  const updateData: Partial<{ name: string; slug: string }> = {};
  if (data.name) updateData.name = data.name;
  if (data.slug) {
    const existing = await saasRepository.findOrganizationBySlug(data.slug);
    if (existing && existing.id !== orgId) {
      throw new AppError('Slug already taken', 'SLUG_TAKEN', 409);
    }
    updateData.slug = data.slug;
  }

  return saasRepository.updateOrganization(orgId, updateData);
}
