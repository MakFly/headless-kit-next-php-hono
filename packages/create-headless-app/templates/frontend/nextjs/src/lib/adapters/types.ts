/**
 * Types for multi-backend auth adapters
 *
 * These types define the common interface for Laravel, Symfony, and Node.js backends
 */

/**
 * Supported backend types
 */
export type BackendType = 'laravel' | 'symfony' | 'node';

/**
 * Permission action type
 */
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'manage';

/**
 * Role slug type
 */
export type RoleSlug = 'admin' | 'moderator' | 'user';

/**
 * User type (self-contained, no external dependency)
 */
export type User = {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  roles: Array<{
    id: number;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
  }>;
  permissions: Array<{
    id: number;
    name: string;
    slug: string;
    resource: string;
    action: PermissionAction;
    created_at: string;
    updated_at: string;
  }>;
};

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
  authPrefix?: string;
};

/**
 * Auth adapter type
 *
 * All backend adapters must implement this type
 */
export type AuthAdapter = {
  login(credentials: LoginRequest): Promise<AuthResponse>;
  register(data: RegisterRequest): Promise<AuthResponse>;
  logout(): Promise<void>;
  refresh(request?: RefreshTokenRequest): Promise<AuthResponse>;
  getUser(): Promise<NormalizedUser | null>;
  getOAuthProviders(): Promise<string[]>;
  getOAuthUrl(provider: string): Promise<string>;
  sendMagicLink?(email: string): Promise<void>;
  storeTokens(tokens: TokenStorage): Promise<void>;
  clearTokens(): Promise<void>;
  getAccessToken(): Promise<string | null>;
};

/**
 * Convert NormalizedUser to User type
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
      action: p.action as PermissionAction,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })),
  };
}

/**
 * Permission check helpers
 */
export function hasPermission(user: User, resource: string, action: PermissionAction): boolean {
  return user.permissions.some(
    (p) => p.resource === resource && (p.action === action || p.action === 'manage')
  );
}

export function hasRole(user: User, roleSlug: RoleSlug): boolean {
  return user.roles.some((r) => r.slug === roleSlug);
}

export function isAdmin(user: User): boolean {
  return hasRole(user, 'admin');
}
