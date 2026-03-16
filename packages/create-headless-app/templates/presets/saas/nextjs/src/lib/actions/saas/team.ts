'use server';

import { bffGet, bffPost, bffPatch, bffDelete } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { TeamMember, TeamRole } from '@/types/saas';

export async function getTeamMembersAction(orgId: string): Promise<TeamMember[]> {
  const response = await bffGet<unknown>(`/api/v1/saas/orgs/${orgId}/team`);
  return unwrapEnvelope<TeamMember[]>(response);
}

export async function inviteTeamMemberAction(orgId: string, email: string, role: TeamRole): Promise<TeamMember> {
  const response = await bffPost<unknown>(`/api/v1/saas/orgs/${orgId}/team/invite`, { email, role });
  return unwrapEnvelope<TeamMember>(response);
}

export async function changeTeamMemberRoleAction(orgId: string, memberId: string, role: TeamRole): Promise<TeamMember> {
  const response = await bffPatch<unknown>(`/api/v1/saas/orgs/${orgId}/team/${memberId}/role`, { role });
  return unwrapEnvelope<TeamMember>(response);
}

export async function removeTeamMemberAction(orgId: string, memberId: string): Promise<void> {
  await bffDelete(`/api/v1/saas/orgs/${orgId}/team/${memberId}`);
}
