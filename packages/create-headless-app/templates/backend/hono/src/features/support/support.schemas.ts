/**
 * Support validation schemas
 */

import { z } from 'zod';

export const createConversationSchema = z.object({
  subject: z.string().min(1, 'subject is required'),
  message: z.string().min(1, 'message is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'content is required'),
});

export const rateConversationSchema = z.object({
  rating: z.number().int().min(1, 'rating must be at least 1').max(5, 'rating must be at most 5'),
});

export const changeStatusSchema = z.object({
  status: z.enum(['open', 'assigned', 'waiting', 'resolved', 'closed']),
});

export const createCannedResponseSchema = z.object({
  title: z.string().min(1, 'title is required'),
  content: z.string().min(1, 'content is required'),
  category: z.string().optional(),
  shortcut: z.string().optional(),
});

export const updateCannedResponseSchema = createCannedResponseSchema.partial();

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type RateConversationInput = z.infer<typeof rateConversationSchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
export type CreateCannedResponseInput = z.infer<typeof createCannedResponseSchema>;
export type UpdateCannedResponseInput = z.infer<typeof updateCannedResponseSchema>;
