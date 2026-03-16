/**
 * SaaS validation schemas
 */

import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string().min(1, 'name is required'),
  slug: z.string().min(1, 'slug is required').regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens'),
});

export const subscribeSchema = z.object({
  planId: z.string().min(1, 'planId is required'),
});

export const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.enum(['member', 'admin']).optional().default('member'),
});

export const updateTeamMemberRoleSchema = z.object({
  role: z.enum(['member', 'admin', 'owner']),
});

export const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'slug must be lowercase alphanumeric with hyphens').optional(),
});

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type SubscribeInput = z.infer<typeof subscribeSchema>;
export type InviteTeamMemberInput = z.infer<typeof inviteTeamMemberSchema>;
export type UpdateTeamMemberRoleInput = z.infer<typeof updateTeamMemberRoleSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
