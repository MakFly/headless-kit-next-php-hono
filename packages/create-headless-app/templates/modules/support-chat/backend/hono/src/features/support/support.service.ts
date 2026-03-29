/**
 * Support service
 */

import * as supportRepository from './support.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

const VALID_TRANSITIONS: Record<string, string[]> = {
  open: ['assigned'],
  assigned: ['waiting'],
  waiting: ['resolved'],
  resolved: ['closed'],
  closed: [],
};

// =========================================================================
// Conversations
// =========================================================================

export async function createConversation(userId: string, subject: string, firstMessage: string, priority?: string) {
  const conv = await supportRepository.createConversation({
    subject,
    userId,
    priority,
  });

  if (!conv) {
    throw new AppError('Failed to create conversation', 'CREATE_FAILED', 500);
  }

  await supportRepository.createMessage({
    conversationId: conv.id,
    senderId: userId,
    senderType: 'user',
    content: firstMessage,
  });

  return supportRepository.findConversationById(conv.id);
}

export async function listUserConversations(userId: string, page?: number, perPage?: number) {
  return supportRepository.findConversationsByUserId(userId, page, perPage);
}

export async function getConversationWithMessages(conversationId: string, userId: string) {
  const conv = await supportRepository.findConversationById(conversationId);
  if (!conv) {
    throw new AppError('Conversation not found', 'NOT_FOUND', 404);
  }

  if (conv.userId !== userId) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  const messagesResult = await supportRepository.findMessagesByConversationId(conversationId);
  return { ...conv, messages: messagesResult.data, messagesPagination: messagesResult.pagination };
}

export async function sendMessage(conversationId: string, senderId: string, senderType: string, content: string) {
  const conv = await supportRepository.findConversationById(conversationId);
  if (!conv) {
    throw new AppError('Conversation not found', 'NOT_FOUND', 404);
  }

  if (conv.status === 'closed') {
    throw new AppError('Cannot send message to closed conversation', 'CONVERSATION_CLOSED', 422);
  }

  const msg = await supportRepository.createMessage({
    conversationId,
    senderId,
    senderType,
    content,
  });

  if (senderType === 'agent' && conv.status === 'assigned') {
    await supportRepository.updateConversation(conversationId, { status: 'waiting' });
  }

  return msg;
}

export async function rateConversation(conversationId: string, userId: string, rating: number) {
  const conv = await supportRepository.findConversationById(conversationId);
  if (!conv) {
    throw new AppError('Conversation not found', 'NOT_FOUND', 404);
  }

  if (conv.userId !== userId) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  if (conv.status !== 'resolved' && conv.status !== 'closed') {
    throw new AppError('Can only rate resolved or closed conversations', 'INVALID_STATUS', 422);
  }

  if (rating < 1 || rating > 5) {
    throw new AppError('Rating must be between 1 and 5', 'INVALID_RATING', 422);
  }

  if (conv.rating !== null) {
    throw new AppError('Conversation already rated', 'ALREADY_RATED', 409);
  }

  return supportRepository.updateConversation(conversationId, { rating });
}

// =========================================================================
// Agent
// =========================================================================

export async function getAgentQueue(page?: number, perPage?: number) {
  return supportRepository.findUnassignedConversations(page, perPage);
}

export async function getAgentAssigned(agentId: string, page?: number, perPage?: number) {
  return supportRepository.findConversationsByAgentId(agentId, page, perPage);
}

export async function assignAgent(conversationId: string, agentId: string) {
  const conv = await supportRepository.findConversationById(conversationId);
  if (!conv) {
    throw new AppError('Conversation not found', 'NOT_FOUND', 404);
  }

  if (conv.agentId) {
    throw new AppError('Conversation already assigned', 'ALREADY_ASSIGNED', 409);
  }

  return supportRepository.assignAgent(conversationId, agentId);
}

export async function changeStatus(conversationId: string, newStatus: string) {
  const conv = await supportRepository.findConversationById(conversationId);
  if (!conv) {
    throw new AppError('Conversation not found', 'NOT_FOUND', 404);
  }

  const allowed = VALID_TRANSITIONS[conv.status];
  if (!allowed || !allowed.includes(newStatus)) {
    throw new AppError(
      `Invalid transition from '${conv.status}' to '${newStatus}'`,
      'INVALID_TRANSITION',
      422
    );
  }

  return supportRepository.updateConversation(conversationId, { status: newStatus });
}

// =========================================================================
// Canned Responses
// =========================================================================

export async function listCannedResponses() {
  return supportRepository.findAllCannedResponses();
}

export async function createCannedResponse(data: { title: string; content: string; category?: string; shortcut?: string; createdBy: string }) {
  if (!data.title || !data.content) {
    throw new AppError('title and content are required', 'VALIDATION_ERROR', 422);
  }

  return supportRepository.createCannedResponse(data);
}

export async function updateCannedResponse(id: string, data: Partial<{ title: string; content: string; category: string; shortcut: string }>) {
  const existing = await supportRepository.findCannedResponseById(id);
  if (!existing) {
    throw new AppError('Canned response not found', 'NOT_FOUND', 404);
  }

  return supportRepository.updateCannedResponse(id, data);
}

export async function deleteCannedResponse(id: string) {
  const deleted = await supportRepository.deleteCannedResponse(id);
  if (!deleted) {
    throw new AppError('Canned response not found', 'NOT_FOUND', 404);
  }
  return true;
}

// =========================================================================
// Ratings Stats
// =========================================================================

export async function getRatingStats() {
  return supportRepository.getRatingStats();
}
