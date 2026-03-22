/**
 * Two-factor authentication validation schemas
 */

import { z } from 'zod';

/**
 * Body for enabling 2FA (confirm with TOTP code)
 */
export const twoFactorEnableSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

/**
 * Body for verifying 2FA during login
 */
export const twoFactorVerifySchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

/**
 * Body for disabling 2FA
 */
export const twoFactorDisableSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be numeric'),
});

/**
 * Body for recovery code login
 */
export const twoFactorRecoverySchema = z.object({
  code: z
    .string()
    .regex(/^[A-Z0-9]{5}-[A-Z0-9]{5}$/, 'Invalid recovery code format (expected XXXXX-XXXXX)'),
});

export type TwoFactorEnableInput = z.infer<typeof twoFactorEnableSchema>;
export type TwoFactorVerifyInput = z.infer<typeof twoFactorVerifySchema>;
export type TwoFactorDisableInput = z.infer<typeof twoFactorDisableSchema>;
export type TwoFactorRecoveryInput = z.infer<typeof twoFactorRecoverySchema>;
