/**
 * Application types
 */

import type { Locale } from '../lib/i18n/index.ts';

/**
 * User entity
 */
export type User = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  emailVerifiedAt: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * User without sensitive data
 */
export type SafeUser = Omit<User, 'passwordHash'>;

/**
 * Role entity
 */
export type Role = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Permission entity
 */
export type Permission = {
  id: number;
  name: string;
  slug: string;
  resource: string;
  action: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Refresh token entity
 */
export type RefreshToken = {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
};

/**
 * JWT payload
 */
export type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
};

/**
 * Auth response
 */
export type AuthResponse = {
  user: SafeUser & { roles?: Role[] };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
};

/**
 * Environment variables
 */
export type Env = {
  PORT: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRES_IN: string;
  JWT_REFRESH_EXPIRES_IN: string;
  FRONTEND_URL: string;
};

/**
 * Organization entity (subset of DB schema)
 */
export type Organization = {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  planId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

/**
 * Team member entity (subset of DB schema)
 */
export type OrgMembership = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  joinedAt: string | null;
};

/**
 * Hono context variables
 */
export type AppVariables = {
  user: SafeUser | null;
  jwtPayload: JwtPayload | null;
  requestId: string;
  org: Organization | null;
  orgMembership: OrgMembership | null;
  locale: Locale;
};
