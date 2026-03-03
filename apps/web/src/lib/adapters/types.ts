/**
 * Types for multi-backend auth adapters
 *
 * These types define the common interface for Laravel, Symfony, and Node.js backends
 */

import type { User } from '@rbac/types';

/**
 * Supported backend types
 */
export type BackendType = 'laravel' | 'symfony' | 'node';

/**
 * Login request payload
 */
export type LoginRequest = {
  email: string;
  password: string;
};

/**
 * Register request payload
 */
export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation?: string;
};

/**
 * Refresh token request payload
 */
export type RefreshTokenRequest = {
  refresh_token?: string;
};

/**
 * Normalized user from any backend
 */
export type NormalizedUser = {
  id: string | number;
  email: string;
  name: string;
  email_verified_at?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  roles?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  permissions?: Array<{
    id: number;
    name: string;
    slug: string;
    resource: string;
    action: string;
  }>;
};

/**
 * Token storage structure
 */
export type TokenStorage = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
};

/**
 * Auth response from adapter (normalized)
 */
export type AuthResponse = {
  user: NormalizedUser;
  tokens: TokenStorage;
};

/**
 * Adapter configuration
 */
export type AdapterConfig = {
  baseUrl: string;
  timeout?: number;
  secret?: string;
  bffId?: string;
  authPrefix?: string;
};

/**
 * Auth adapter type
 *
 * All backend adapters must implement this type
 */
export type AuthAdapter = {
  /**
   * Log in a user
   */
  login(credentials: LoginRequest): Promise<AuthResponse>;

  /**
   * Register a new user
   */
  register(data: RegisterRequest): Promise<AuthResponse>;

  /**
   * Log out the current user
   */
  logout(): Promise<void>;

  /**
   * Refresh the access token
   */
  refresh(request?: RefreshTokenRequest): Promise<AuthResponse>;

  /**
   * Get the current authenticated user
   */
  getUser(): Promise<NormalizedUser | null>;

  /**
   * Get available OAuth providers
   */
  getOAuthProviders(): Promise<string[]>;

  /**
   * Get OAuth redirect URL for a provider
   */
  getOAuthUrl(provider: string): Promise<string>;

  /**
   * Send magic link email (optional, backend dependent)
   */
  sendMagicLink?(email: string): Promise<void>;

  /**
   * Store tokens in HttpOnly cookies
   */
  storeTokens(tokens: TokenStorage): Promise<void>;

  /**
   * Clear all auth tokens
   */
  clearTokens(): Promise<void>;

  /**
   * Get current access token from cookie
   */
  getAccessToken(): Promise<string | null>;
};

/**
 * Convert NormalizedUser to legacy User type for backward compatibility
 */
export function toUser(normalized: NormalizedUser): User {
  return {
    id: typeof normalized.id === 'string' ? parseInt(normalized.id, 10) : normalized.id,
    name: normalized.name,
    email: normalized.email,
    email_verified_at: normalized.email_verified_at ?? null,
    avatar_url: normalized.avatar_url ?? undefined,
    created_at: normalized.created_at ?? new Date().toISOString(),
    updated_at: normalized.updated_at ?? new Date().toISOString(),
    roles: (normalized.roles ?? []).map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
    permissions: (normalized.permissions ?? []).map(p => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      resource: p.resource,
      action: p.action as 'create' | 'read' | 'update' | 'delete' | 'manage',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  };
}
