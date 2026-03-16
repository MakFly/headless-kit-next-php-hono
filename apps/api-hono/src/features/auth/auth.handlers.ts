/**
 * Auth handlers
 */

import type { Context } from 'hono';
import * as authService from './auth.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess, apiError } from '../../shared/lib/response.ts';
import { requireUser } from '../../shared/middleware/auth.ts';
import type { AppVariables } from '../../shared/types/index.ts';
import type { LoginInput, RegisterInput, RefreshInput } from './auth.schemas.ts';

/**
 * Format auth response payload for API (camelCase + snake_case aliases)
 */
function formatAuthResponse(response: Awaited<ReturnType<typeof authService.login>>) {
  return {
    user: {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      emailVerifiedAt: response.user.emailVerifiedAt,
      email_verified_at: response.user.emailVerifiedAt,
      avatarUrl: response.user.avatarUrl,
      avatar_url: response.user.avatarUrl,
      createdAt: response.user.createdAt,
      created_at: response.user.createdAt,
      updatedAt: response.user.updatedAt,
      updated_at: response.user.updatedAt,
      roles: response.user.roles,
    },
    accessToken: response.accessToken,
    access_token: response.accessToken,
    refreshToken: response.refreshToken,
    refresh_token: response.refreshToken,
    expiresIn: response.expiresIn,
    expires_in: response.expiresIn,
    tokenType: response.tokenType,
    token_type: response.tokenType,
  };
}

/**
 * Register handler
 */
export async function register(c: Context, data: RegisterInput) {
  const response = await authService.register({
    email: data.email,
    name: data.name,
    password: data.password,
  });

  return apiSuccess(c, formatAuthResponse(response), undefined, 201);
}

/**
 * Login handler
 */
export async function login(c: Context, data: LoginInput) {
  const response = await authService.login({
    email: data.email,
    password: data.password,
  });

  return apiSuccess(c, formatAuthResponse(response));
}

/**
 * Refresh token handler
 */
export async function refresh(c: Context, data: RefreshInput) {
  const refreshToken = data.refreshToken || data.refresh_token;
  if (!refreshToken) {
    return apiError(c, 'MISSING_TOKEN', 'Refresh token is required', 400);
  }

  const response = await authService.refresh(refreshToken);
  return apiSuccess(c, formatAuthResponse(response));
}

/**
 * Logout handler
 */
export async function logout(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);

  let refreshToken: string | undefined;
  try {
    const body = await c.req.json();
    refreshToken = body.refreshToken || body.refresh_token;
  } catch {
    // No body — acceptable
  }

  await authService.logout(refreshToken, user.id);

  return apiSuccess(c, { message: 'Logged out successfully' });
}

/**
 * Get current user handler
 */
export async function me(c: Context<{ Variables: AppVariables }>) {
  const user = requireUser(c);

  const userWithRoles = await authService.getCurrentUser(user.id);
  if (!userWithRoles) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 404);
  }

  return apiSuccess(c, {
    id: userWithRoles.id,
    email: userWithRoles.email,
    name: userWithRoles.name,
    emailVerifiedAt: userWithRoles.emailVerifiedAt,
    email_verified_at: userWithRoles.emailVerifiedAt,
    avatarUrl: userWithRoles.avatarUrl,
    avatar_url: userWithRoles.avatarUrl,
    createdAt: userWithRoles.createdAt,
    created_at: userWithRoles.createdAt,
    updatedAt: userWithRoles.updatedAt,
    updated_at: userWithRoles.updatedAt,
    roles: userWithRoles.roles,
  });
}

/**
 * Get OAuth providers handler
 */
export async function getOAuthProviders(c: Context) {
  return apiSuccess(c, { providers: [] });
}
