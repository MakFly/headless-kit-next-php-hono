'use server';

import { bffGet, bffPost, bffPut, bffDelete } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { CannedResponse } from '@/types/support';
import type { CsatRatings } from '@/types/support';

export async function getCannedResponsesAction(): Promise<CannedResponse[]> {
  const response = await bffGet<unknown>('/api/v1/support/agent/canned');
  return unwrapEnvelope<CannedResponse[]>(response);
}

export async function createCannedResponseAction(data: {
  title: string;
  content: string;
  category?: string;
  shortcut?: string;
}): Promise<CannedResponse> {
  const response = await bffPost<unknown>('/api/v1/support/agent/canned', data);
  return unwrapEnvelope<CannedResponse>(response);
}

export async function updateCannedResponseAction(
  id: string,
  data: { title: string; content: string; category?: string; shortcut?: string }
): Promise<CannedResponse> {
  const response = await bffPut<unknown>(`/api/v1/support/agent/canned/${id}`, data);
  return unwrapEnvelope<CannedResponse>(response);
}

export async function deleteCannedResponseAction(id: string): Promise<void> {
  await bffDelete(`/api/v1/support/agent/canned/${id}`);
}

export async function getRatingsAction(): Promise<CsatRatings> {
  const response = await bffGet<unknown>('/api/v1/support/agent/ratings');
  return unwrapEnvelope<CsatRatings>(response);
}
