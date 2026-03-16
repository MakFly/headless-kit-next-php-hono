'use server';

import { bffGet, bffPost, bffDelete } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { Subscription, Invoice, Plan } from '@/types/saas';

export async function getSubscriptionAction(orgId: string): Promise<Subscription | null> {
  try {
    const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}/subscription`);
    return unwrapEnvelope<Subscription>(response);
  } catch {
    return null;
  }
}

export async function subscribeAction(orgId: string, planId: string): Promise<Subscription> {
  const response = await bffPost<unknown>(`/api/v1/saas/orgs/${orgId}/subscription`, { planId });
  return unwrapEnvelope<Subscription>(response);
}

export async function cancelSubscriptionAction(orgId: string): Promise<void> {
  await bffDelete(`/api/v1/saas/orgs/${orgId}/subscription`);
}

export async function getInvoicesAction(orgId: string): Promise<Invoice[]> {
  const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}/invoices`);
  return unwrapEnvelope<Invoice[]>(response);
}

export async function getPlansAction(): Promise<Plan[]> {
  const response = await bffGet<unknown>('/api/v1/saas/plans', { skipAuth: true });
  return unwrapEnvelope<Plan[]>(response);
}
