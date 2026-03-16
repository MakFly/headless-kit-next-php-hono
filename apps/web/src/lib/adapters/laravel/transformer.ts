/**
 * Laravel response transformer
 *
 * Normalizes Laravel API responses to the common adapter format
 */

import type { NormalizedUser, TokenStorage, AuthResponse } from '../types';

/**
 * Laravel user response structure
 */
type LaravelUser = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    permissions?: Array<{
      id: number;
      name: string;
      slug: string;
      resource: string;
      action: string;
    }>;
    created_at: string;
    updated_at: string;
  }>;
  permissions?: Array<{
    id: number;
    name: string;
    slug: string;
    resource: string;
    action: string;
    created_at: string;
    updated_at: string;
  }>;
};

/**
 * Laravel auth response structure
 */
type LaravelAuthResponse = {
  data?: {
    user: LaravelUser;
    access_token: string;
    token_type?: string;
    expires_in?: number;
  };
  user?: LaravelUser;
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  message?: string;
};

/**
 * Laravel /me response structure
 */
type LaravelMeResponse = {
  data?: LaravelUser;
  user?: LaravelUser;
};

/**
 * Transform Laravel user to normalized user
 */
export function transformUser(laravelUser: LaravelUser): NormalizedUser {
  // Handle roles as either array of objects or array of strings
  const rawRoles = laravelUser.roles ?? [];
  const roles = rawRoles.map((r: unknown) => {
    if (typeof r === 'string') {
      return { id: 0, name: r, slug: r.toLowerCase().replace('role_', '') };
    }
    const role = r as { id: number; name: string; slug: string };
    return { id: role.id, name: role.name, slug: role.slug };
  });

  // Handle permissions as either array of objects or array of strings
  const rawPermissions = laravelUser.permissions ?? [];
  const permissions = rawPermissions.map((p: unknown) => {
    if (typeof p === 'string') {
      return { id: 0, name: p, slug: p, resource: p, action: 'read' };
    }
    const perm = p as { id: number; name: string; slug: string; resource: string; action: string };
    return { id: perm.id, name: perm.name, slug: perm.slug, resource: perm.resource, action: perm.action };
  });

  return {
    id: laravelUser.id,
    email: laravelUser.email,
    name: laravelUser.name,
    email_verified_at: laravelUser.email_verified_at,
    avatar_url: laravelUser.avatar_url ?? null,
    created_at: laravelUser.created_at,
    updated_at: laravelUser.updated_at,
    roles,
    permissions,
  };
}

/**
 * Transform Laravel auth response to normalized auth response
 */
export function transformAuthResponse(response: LaravelAuthResponse): AuthResponse {
  // Handle both { data: { user, access_token } } and { user, access_token } formats
  const payload = response.data ?? response;

  const tokens: TokenStorage = {
    access_token: payload.access_token!,
    token_type: payload.token_type || 'Bearer',
    expires_in: payload.expires_in,
    refresh_token: (payload as Record<string, unknown>).refresh_token as string | undefined,
  };

  return {
    user: transformUser(payload.user!),
    tokens,
  };
}

/**
 * Transform Laravel /me response to normalized user
 */
export function transformMeResponse(response: LaravelMeResponse): NormalizedUser {
  const user = response.data ?? response.user;
  return transformUser(user!);
}

/**
 * Transform Laravel OAuth providers response
 */
export function transformOAuthProviders(response: { data: string[] }): string[] {
  return response.data;
}

/**
 * Transform Laravel OAuth redirect response
 */
export function transformOAuthRedirect(response: { data: { redirect_url: string } }): string {
  return response.data.redirect_url;
}
