/**
 * Environment Configuration
 *
 * Centralized configuration for all environment variables.
 * Import from here instead of using process.env directly.
 */

/**
 * Auth backend type
 */
export type AuthBackend = 'laravel' | 'symfony' | 'node';

/**
 * Environment configuration object
 */
export const env = {
  // App Configuration
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  NODE_ENV: process.env.NODE_ENV || 'development',

  get isProduction() {
    return this.NODE_ENV === 'production';
  },

  get isDevelopment() {
    return this.NODE_ENV === 'development';
  },

  // Cookie Configuration
  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'auth_token',
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'refresh_token',
  TOKEN_EXPIRES_COOKIE_NAME: process.env.TOKEN_EXPIRES_COOKIE_NAME || 'token_expires_at',

  // Auth Backend Selection
  AUTH_BACKEND: (process.env.AUTH_BACKEND || '{{BACKEND}}') as AuthBackend,

  // Laravel API Configuration
  LARAVEL_API_URL: process.env.LARAVEL_API_URL || 'http://localhost:8000',

  // Symfony API Configuration
  SYMFONY_API_URL: process.env.SYMFONY_API_URL || 'http://localhost:8002',
  SYMFONY_AUTH_PREFIX: process.env.SYMFONY_AUTH_PREFIX || '/api/v1/auth',

  // Node.js API Configuration
  NODE_API_URL: process.env.NODE_API_URL || 'http://localhost:8003',
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
 */
export function validateEnv(): void {
  const warnings: string[] = [];

  if (warnings.length > 0) {
    console.warn('[env] Configuration warnings:');
    warnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

export default env;
