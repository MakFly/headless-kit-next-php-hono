'use server';

import { bffGet, bffPatch } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type { AgentQueue, ConversationStatus } from '@/types/support';

export async function getAgentQueueAction(): Promise<AgentQueue> {
  const [queueRes, assignedRes] = await Promise.all([
    bffGet<unknown>('/api/v1/support/agent/queue'),
    bffGet<unknown>('/api/v1/support/agent/assigned'),
  ]);
  const unassigned = unwrapEnvelope<AgentQueue['unassigned']>(queueRes);
  const assigned = unwrapEnvelope<AgentQueue['assigned']>(assignedRes);
  return {
    unassigned: Array.isArray(unassigned) ? unassigned : [],
    assigned: Array.isArray(assigned) ? assigned : [],
    totalOpen: (Array.isArray(unassigned) ? unassigned.length : 0) + (Array.isArray(assigned) ? assigned.length : 0),
  };
}

export async function assignConversationAction(conversationId: string): Promise<void> {
  await bffPatch(`/api/v1/support/agent/conversations/${conversationId}/assign`);
}

export async function updateConversationStatusAction(
  conversationId: string,
  status: ConversationStatus
): Promise<void> {
  await bffPatch(`/api/v1/support/agent/conversations/${conversationId}/status`, { status });
}
