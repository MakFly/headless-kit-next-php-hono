/**
 * Environment Configuration
 *
 * Centralized configuration for all environment variables.
 * Import from here instead of using process.env directly.
 *
 * @example
 * ```typescript
 * import { env } from '@/lib/config/env';
 *
 * const url = env.NEXT_PUBLIC_APP_URL;
 * const cookieName = env.AUTH_COOKIE_NAME;
 * ```
 */

/**
 * Auth backend type
 */
export type AuthBackend = 'laravel' | 'symfony' | 'node';

/**
 * Environment configuration object
 */
export const env = {
  // =========================================================================
  // App Configuration
  // =========================================================================

  /** Public app URL (used for BFF requests) */
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3300',

  /** Node environment */
  NODE_ENV: process.env.NODE_ENV || 'development',

  /** Is production environment */
  get isProduction() {
    return this.NODE_ENV === 'production';
  },

  /** Is development environment */
  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  // =========================================================================
  // Cookie Configuration
  // =========================================================================

  /** Auth cookie name (HttpOnly) */
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'auth_token',

  /** Refresh token cookie name */
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'refresh_token',

  /** Token expiration cookie name (non-HttpOnly, for client awareness) */
  TOKEN_EXPIRES_COOKIE_NAME: process.env.TOKEN_EXPIRES_COOKIE_NAME || 'token_expires_at',

  // =========================================================================
  // Auth Backend Selection
  // =========================================================================

  /** Selected auth backend */
  AUTH_BACKEND: (process.env.AUTH_BACKEND || 'laravel') as AuthBackend,

  // =========================================================================
  // Laravel API Configuration
  // =========================================================================

  /** Laravel API base URL */
  LARAVEL_API_URL: process.env.LARAVEL_API_URL || 'http://localhost:8002',

  // =========================================================================
  // Symfony API Configuration
  // =========================================================================

  /** Symfony API base URL */
  SYMFONY_API_URL: process.env.SYMFONY_API_URL || 'http://localhost:8001',

  /** Symfony auth endpoint prefix */
  SYMFONY_AUTH_PREFIX: process.env.SYMFONY_AUTH_PREFIX || '/api/v1/auth',

  // =========================================================================
  // Node.js API Configuration
  // =========================================================================

  /** Node.js API base URL */
  NODE_API_URL: process.env.NODE_API_URL || 'http://localhost:3333',

  /** Node.js auth endpoint prefix */
  NODE_AUTH_PREFIX: process.env.NODE_AUTH_PREFIX || '/api/v1/auth',
} as const;

/**
 * Cookie names configuration (derived from env)
 */
export const COOKIE_NAMES = {
  ACCESS_TOKEN: env.AUTH_COOKIE_NAME,
  REFRESH_TOKEN: env.REFRESH_COOKIE_NAME,
  TOKEN_EXPIRES_AT: env.TOKEN_EXPIRES_COOKIE_NAME,
} as const;

/**
 * Validate required environment variables
 * Call this at app startup to catch missing config early
 */
export function validateEnv(): void {
  const warnings: string[] = [];

  if (warnings.length > 0) {
    console.warn('[env] Configuration warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

export default env;
