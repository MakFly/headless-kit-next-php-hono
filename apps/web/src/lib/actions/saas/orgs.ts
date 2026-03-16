'use server';

import { bffGet, bffPost } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { OrgMembership, CreateOrgData } from '@/types/saas';

export async function listOrgsAction(): Promise<OrgMembership[]> {
  const response = await bffGet<unknown>('/api/v1/saas/orgs');
  return unwrapEnvelope<OrgMembership[]>(response);
}

export async function createOrgAction(data: CreateOrgData): Promise<OrgMembership> {
  const response = await bffPost<unknown>('/api/v1/saas/orgs', data);
  return unwrapEnvelope<OrgMembership>(response);
}

export async function getOrgAction(orgId: string): Promise<OrgMembership> {
  const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}`);
  return unwrapEnvelope<OrgMembership>(response);
}
