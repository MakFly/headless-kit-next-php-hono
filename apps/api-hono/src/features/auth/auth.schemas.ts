/**
 * Auth validation schemas
 */

import { z } from 'zod';

/**
 * Login request schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Register request schema
 */
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string().optional(),
}).refine(
  (data) => {
    // If password_confirmation is provided, it must match password
    if (data.password_confirmation !== undefined) {
      return data.password === data.password_confirmation;
    }
    return true;
  },
  {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  }
);

/**
 * Refresh token request schema
 */
export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
  refresh_token: z.string().optional(),
}).refine(
  (data) => data.refreshToken || data.refresh_token,
  {
    message: 'Refresh token is required',
    path: ['refresh_token'],
  }
);

/**
 * Forgot password request schema
 */
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

/**
 * Verify reset token schema
 */
export const verifyResetTokenSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

/**
 * Reset password schema
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type VerifyResetTokenInput = z.infer<typeof verifyResetTokenSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
