'use server';

import { bffGet } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { SaasDashboard, Plan } from '@/types/saas';

export async function getSaasDashboardAction(orgId: string): Promise<SaasDashboard> {
  const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}/dashboard`);
  return unwrapEnvelope<SaasDashboard>(response);
}

export async function getPlansAction(): Promise<Plan[]> {
  const response = await bffGet<unknown>('/api/v1/saas/plans', { skipAuth: true });
  return unwrapEnvelope<Plan[]>(response);
}
