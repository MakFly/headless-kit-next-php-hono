export type AuthBackend = 'laravel' | 'symfony' | 'node'

export const env = {
  VITE_APP_URL: import.meta.env.VITE_APP_URL || 'http://localhost:3301',

  NODE_ENV: process.env.NODE_ENV || 'development',

  get isProduction() {
    return this.NODE_ENV === 'production'
  },

  get isDevelopment() {
    return this.NODE_ENV === 'development'
  },

  AUTH_COOKIE_NAME: process.env.AUTH_COOKIE_NAME || 'auth_token',
  REFRESH_COOKIE_NAME: process.env.REFRESH_COOKIE_NAME || 'refresh_token',
  TOKEN_EXPIRES_COOKIE_NAME:
    process.env.TOKEN_EXPIRES_COOKIE_NAME || 'token_expires_at',

  AUTH_BACKEND: (process.env.AUTH_BACKEND || 'laravel') as AuthBackend,

  LARAVEL_API_URL: process.env.LARAVEL_API_URL || 'http://localhost:8002',

  SYMFONY_API_URL: process.env.SYMFONY_API_URL || 'http://localhost:8001',
  SYMFONY_AUTH_PREFIX: process.env.SYMFONY_AUTH_PREFIX || '/api/v1/auth',

  NODE_API_URL: process.env.NODE_API_URL || 'http://localhost:3333',
  NODE_AUTH_PREFIX: process.env.NODE_AUTH_PREFIX || '/api/v1/auth',
} as const

export const COOKIE_NAMES = {
  ACCESS_TOKEN: env.AUTH_COOKIE_NAME,
  REFRESH_TOKEN: env.REFRESH_COOKIE_NAME,
  TOKEN_EXPIRES_AT: env.TOKEN_EXPIRES_COOKIE_NAME,
} as const

export default env
