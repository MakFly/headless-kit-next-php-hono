'use server';

import { bffGet, bffPatch } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { UsageRecord, SaasSettings } from '@/types/saas';

export async function getUsageAction(orgId: string): Promise<UsageRecord[]> {
  const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}/usage`);
  return unwrapEnvelope<UsageRecord[]>(response);
}

export async function getSettingsAction(orgId: string): Promise<SaasSettings> {
  const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}/settings`);
  return unwrapEnvelope<SaasSettings>(response);
}

export async function updateSettingsAction(orgId: string, settings: { name: string; slug: string }): Promise<SaasSettings> {
  const response = await bffPatch<unknown>(`/api/v1/saas/orgs/${orgId}/settings`, settings);
  return unwrapEnvelope<SaasSettings>(response);
}
