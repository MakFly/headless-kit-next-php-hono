/**
 * Node.js response transformer
 *
 * Normalizes Node.js API responses to the common adapter format
 * Compatible with Hono, Express, Fastify, and other Node.js frameworks
 */

import type { NormalizedUser, TokenStorage, AuthResponse } from '../types';

/**
 * Node.js user response structure (standardized)
 */
type NodeUser = {
  id: string;
  email: string;
  name: string;
  emailVerifiedAt?: string | null;
  email_verified_at?: string | null;
  avatarUrl?: string | null;
  avatar_url?: string | null;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  roles?: Array<string | { id: number; name: string; slug: string }>;
  permissions?: Array<string | { id: number; name: string; slug: string; resource: string; action: string }>;
};

/**
 * Node.js auth response structure (standardized)
 * Supports both camelCase and snake_case for flexibility
 */
type NodeAuthResponse = {
  user: NodeUser;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  expiresIn?: number;
  expires_in?: number;
  tokenType?: string;
  token_type?: string;
};

/**
 * Transform Node.js user to normalized user
 */
export function transformUser(nodeUser: NodeUser): NormalizedUser {
  // Handle roles - can be string array or object array
  const roles = nodeUser.roles?.map((role, index) => {
    if (typeof role === 'string') {
      return {
        id: index + 1,
        name: role.replace('ROLE_', '').toLowerCase(),
        slug: role.replace('ROLE_', '').toLowerCase(),
      };
    }
    return role;
  });

  // Handle permissions - can be string array or object array
  const permissions = nodeUser.permissions?.map((perm, index) => {
    if (typeof perm === 'string') {
      // Parse permission string like "users:read" or "posts:create"
      const [resource, action] = perm.split(':');
      return {
        id: index + 1,
        name: perm,
        slug: perm,
        resource: resource || perm,
        action: action || 'read',
      };
    }
    return perm;
  });

  return {
    id: nodeUser.id,
    email: nodeUser.email,
    name: nodeUser.name,
    email_verified_at: nodeUser.emailVerifiedAt ?? nodeUser.email_verified_at ?? null,
    avatar_url: nodeUser.avatarUrl ?? nodeUser.avatar_url ?? null,
    created_at: nodeUser.createdAt ?? nodeUser.created_at,
    updated_at: nodeUser.updatedAt ?? nodeUser.updated_at,
    roles,
    permissions,
  };
}

/**
 * Transform Node.js auth response to normalized auth response.
 * Handles both native format and envelope { success, data: NodeAuthResponse }.
 */
export function transformAuthResponse(
  response: NodeAuthResponse | { success: boolean; data: NodeAuthResponse }
): AuthResponse {
  // Handle envelope format
  const payload: NodeAuthResponse =
    'success' in response &&
    response.data &&
    typeof response.data === 'object' &&
    ('accessToken' in (response.data as object) || 'access_token' in (response.data as object))
      ? (response as { data: NodeAuthResponse }).data
      : (response as NodeAuthResponse);

  const tokens: TokenStorage = {
    access_token: payload.accessToken || payload.access_token || '',
    refresh_token: payload.refreshToken || payload.refresh_token,
    token_type: payload.tokenType || payload.token_type || 'Bearer',
    expires_in: payload.expiresIn || payload.expires_in,
  };

  return {
    user: transformUser(payload.user),
    tokens,
  };
}

/**
 * Transform Node.js /me response to normalized user.
 * Handles both native format and envelope { success, data: NodeUser | { user: NodeUser } }.
 */
export function transformMeResponse(
  response:
    | NodeUser
    | { user: NodeUser }
    | { success: boolean; data: NodeUser | { user: NodeUser } }
): NormalizedUser {
  let inner: NodeUser | { user: NodeUser } = response as NodeUser | { user: NodeUser };
  if ('success' in response && 'data' in response) {
    inner = (response as { data: NodeUser | { user: NodeUser } }).data;
  }
  const user =
    'user' in inner && (inner as { user: NodeUser }).user
      ? (inner as { user: NodeUser }).user
      : (inner as NodeUser);
  return transformUser(user);
}

/**
 * Transform Node.js OAuth providers response
 */
export function transformOAuthProviders(
  response: { providers: string[] } | string[] | { data: string[] }
): string[] {
  if (Array.isArray(response)) {
    return response;
  }
  if ('data' in response) {
    return response.data;
  }
  return response.providers;
}

/**
 * Transform Node.js OAuth redirect response
 */
export function transformOAuthRedirect(
  response: { url: string } | { redirectUrl: string } | { redirect_url: string }
): string {
  if ('url' in response) {
    return response.url;
  }
  if ('redirectUrl' in response) {
    return response.redirectUrl;
  }
  return response.redirect_url;
}
