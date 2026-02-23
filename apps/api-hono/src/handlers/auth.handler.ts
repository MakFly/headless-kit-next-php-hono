/**
 * Auth handlers
 */

import type { Context } from 'hono';
import { authService, AuthError } from '../services/index.ts';
import { requireUser } from '../middleware/index.ts';
import type { AppVariables } from '../types/index.ts';
import type { LoginInput, RegisterInput, RefreshInput } from './schemas.ts';

/**
 * Format auth response for API
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
 * Handle service errors
 */
function handleError(c: Context, error: unknown) {
  const requestId = c.get('requestId');

  if (error instanceof AuthError) {
    return c.json(
      {
        error: error.message,
        code: error.code,
        status: error.statusCode,
        request_id: requestId,
      },
      error.statusCode as 400 | 401 | 403 | 404 | 409 | 429
    );
  }

  console.error('Auth error:', error);
  return c.json(
    {
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      status: 500,
      request_id: requestId,
    },
    500
  );
}

/**
 * Register handler
 */
export async function register(c: Context, data: RegisterInput) {
  try {
    const response = await authService.register({
      email: data.email,
      name: data.name,
      password: data.password,
    });

    return c.json(formatAuthResponse(response), 201);
  } catch (error) {
    return handleError(c, error);
  }
}

/**
 * Login handler
 */
export async function login(c: Context, data: LoginInput) {
  try {
    const response = await authService.login({
      email: data.email,
      password: data.password,
    });

    return c.json(formatAuthResponse(response));
  } catch (error) {
    return handleError(c, error);
  }
}

/**
 * Refresh token handler
 */
export async function refresh(c: Context, data: RefreshInput) {
  try {
    const refreshToken = data.refreshToken || data.refresh_token;
    if (!refreshToken) {
      return c.json(
        {
          error: 'Refresh token is required',
          code: 'MISSING_TOKEN',
          status: 400,
          request_id: c.get('requestId'),
        },
        400
      );
    }

    const response = await authService.refresh(refreshToken);

    return c.json(formatAuthResponse(response));
  } catch (error) {
    return handleError(c, error);
  }
}

/**
 * Logout handler
 */
export async function logout(c: Context<{ Variables: AppVariables }>) {
  try {
    const user = requireUser(c);

    // Try to get refresh token from body
    let refreshToken: string | undefined;
    try {
      const body = await c.req.json();
      refreshToken = body.refreshToken || body.refresh_token;
    } catch {
      // No body
    }

    await authService.logout(refreshToken, user.id);

    return c.json({ message: 'Logged out successfully' });
  } catch (error) {
    return handleError(c, error);
  }
}

/**
 * Get current user handler
 */
export async function me(c: Context<{ Variables: AppVariables }>) {
  try {
    const user = requireUser(c);

    const userWithRoles = await authService.getCurrentUser(user.id);
    if (!userWithRoles) {
      return c.json(
        {
          error: 'User not found',
          code: 'USER_NOT_FOUND',
          status: 404,
          request_id: c.get('requestId'),
        },
        404
      );
    }

    return c.json({
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
  } catch (error) {
    return handleError(c, error);
  }
}

/**
 * Get OAuth providers handler
 *
 * Returns the list of available SSO (Single Sign-On) providers:
 * - Google OAuth 2.0
 * - GitHub OAuth
 * - Apple Sign In
 * - Microsoft / Azure AD
 * - etc.
 *
 * Each provider allows users to authenticate using their existing
 * accounts instead of creating a new username/password.
 */
export async function getOAuthProviders(c: Context) {
  // TODO: Implement OAuth providers (Google, GitHub, Apple, Microsoft, etc.)
  // Return empty array until SSO providers are configured
  return c.json({ providers: [] });
}
