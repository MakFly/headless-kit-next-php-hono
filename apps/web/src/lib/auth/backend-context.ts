import { env } from '@/lib/config/env';
import type { BackendType } from '@/lib/adapters/types';

export const AUTH_BACKEND_COOKIE = 'auth_backend';

export function normalizeBackend(value: string | null | undefined): BackendType | null {
  if (!value) {
    return null;
  }

  if (value === 'hono' || value === 'node') {
    return 'node';
  }

  if (value === 'laravel' || value === 'symfony') {
    return value;
  }

  return null;
}

export function getDefaultBackend(): BackendType {
  return normalizeBackend(env.AUTH_BACKEND) ?? 'laravel';
}

export function resolveBackend(cookieValue: string | null | undefined): BackendType {
  return normalizeBackend(cookieValue) ?? getDefaultBackend();
}

export function getCookieNamesForBackend(backend: BackendType): {
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: string;
} {
  const suffix = backend;

  return {
    accessToken: `${env.AUTH_COOKIE_NAME}_${suffix}`,
    refreshToken: `${env.REFRESH_COOKIE_NAME}_${suffix}`,
    tokenExpiresAt: `${env.TOKEN_EXPIRES_COOKIE_NAME}_${suffix}`,
  };
}
