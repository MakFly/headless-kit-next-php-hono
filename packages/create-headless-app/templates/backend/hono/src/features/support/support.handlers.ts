/**
 * Support handlers
 */

import type { Context } from 'hono';
import * as supportService from './support.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';
import { requireUser } from '../../shared/middleware/auth.ts';
import type { AppVariables } from '../../shared/types/index.ts';

// =========================================================================
// User: Conversations
// =========================================================================

export async function listConversations(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const perPage = Math.max(1, Number(c.req.query('per_page')) || 50);
  const result = await supportService.listUserConversations(user.id, page, perPage);
  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    per_page: pagination.perPage,
    total: pagination.total,
    last_page: pagination.totalPages,
  });
}

export async function createConversation(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const body = await c.req.json();

  const { subject, message, priority } = body;
  if (!subject || !message) {
    throw new AppError('subject and message are required', 'VALIDATION_ERROR', 422);
  }

  const conv = await supportService.createConversation(user.id, subject, message, priority);
  return apiSuccess(c, conv, undefined, 201);
}

export async function getConversation(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const id = c.req.param('id');
  const conv = await supportService.getConversationWithMessages(id, user.id);
  return apiSuccess(c, conv);
}

export async function sendMessage(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const conversationId = c.req.param('id');
  const body = await c.req.json();

  if (!body.content) {
    throw new AppError('content is required', 'VALIDATION_ERROR', 422);
  }

  const msg = await supportService.sendMessage(conversationId, user.id, 'user', body.content);
  return apiSuccess(c, msg, undefined, 201);
}

export async function rateConversation(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const conversationId = c.req.param('id');
  const body = await c.req.json();

  if (body.rating === undefined) {
    throw new AppError('rating is required', 'VALIDATION_ERROR', 422);
  }

  const conv = await supportService.rateConversation(conversationId, user.id, body.rating);
  return apiSuccess(c, conv);
}

// =========================================================================
// Agent
// =========================================================================

export async function getAgentQueue(c: Context<{ Variables: AppVariables }>) {
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const perPage = Math.max(1, Number(c.req.query('per_page')) || 50);
  const result = await supportService.getAgentQueue(page, perPage);
  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    per_page: pagination.perPage,
    total: pagination.total,
    last_page: pagination.totalPages,
  });
}

export async function getAgentAssigned(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const page = Math.max(1, Number(c.req.query('page')) || 1);
  const perPage = Math.max(1, Number(c.req.query('per_page')) || 50);
  const result = await supportService.getAgentAssigned(user.id, page, perPage);
  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    per_page: pagination.perPage,
    total: pagination.total,
    last_page: pagination.totalPages,
  });
}

export async function assignConversation(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const id = c.req.param('id');
  const conv = await supportService.assignAgent(id, user.id);
  return apiSuccess(c, conv);
}

export async function changeStatus(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const body = await c.req.json();

  if (!body.status) {
    throw new AppError('status is required', 'VALIDATION_ERROR', 422);
  }

  const conv = await supportService.changeStatus(id, body.status);
  return apiSuccess(c, conv);
}

// =========================================================================
// Canned Responses
// =========================================================================

export async function listCannedResponses(c: Context<{ Variables: AppVariables }>) {
  const responses = await supportService.listCannedResponses();
  return apiSuccess(c, responses);
}

export async function createCannedResponse(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);
  const body = await c.req.json();

  const response = await supportService.createCannedResponse({
    title: body.title,
    content: body.content,
    category: body.category,
    shortcut: body.shortcut,
    createdBy: user.id,
  });
  return apiSuccess(c, response, undefined, 201);
}

export async function updateCannedResponse(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const response = await supportService.updateCannedResponse(id, body);
  return apiSuccess(c, response);
}

export async function deleteCannedResponse(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  await supportService.deleteCannedResponse(id);
  return apiSuccess(c, { message: 'Canned response deleted' });
}

// =========================================================================
// CSAT Ratings
// =========================================================================

export async function getRatingStats(c: Context<{ Variables: AppVariables }>) {
  const stats = await supportService.getRatingStats();
  return apiSuccess(c, stats);
}
