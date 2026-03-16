'use server';

import { bffGet, bffPost } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';
import type {
  Conversation,
  ConversationWithMessages,
  CreateConversation,
} from '@/types/support';

export async function getConversationsAction(): Promise<Conversation[]> {
  const response = await bffGet<unknown>('/api/v1/support/conversations');
  return unwrapEnvelope<Conversation[]>(response);
}

export async function getConversationAction(id: string): Promise<ConversationWithMessages> {
  const response = await bffGet<unknown>(`/api/v1/support/conversations/${id}`);
  return unwrapEnvelope<ConversationWithMessages>(response);
}

export async function createConversationAction(data: CreateConversation): Promise<Conversation> {
  const response = await bffPost<unknown>('/api/v1/support/conversations', data);
  return unwrapEnvelope<Conversation>(response);
}

export async function sendMessageAction(conversationId: string, content: string): Promise<void> {
  await bffPost(`/api/v1/support/conversations/${conversationId}/messages`, { content });
}

export async function rateConversationAction(conversationId: string, rating: number): Promise<void> {
  await bffPost(`/api/v1/support/conversations/${conversationId}/rate`, { rating });
}
