/**
 * Token Service
 *
 * Token-agnostic utilities for the BFF layer.
 * Uses `expires_in` / `token_expires_at` cookie as source of truth
 * instead of decoding the token (compatible with JWT, Paseto V4, etc.).
 */

import { COOKIE_NAMES as ENV_COOKIE_NAMES } from '@/lib/config/env';

/**
 * Configuration constants
 */
export const TOKEN_CONFIG = {
  /** Access token max age in seconds (1 hour) */
  ACCESS_TOKEN_MAX_AGE: 60 * 60,
  /** Refresh token max age in seconds (30 days) */
  REFRESH_TOKEN_MAX_AGE: 60 * 60 * 24 * 30,
  /** Threshold in seconds before expiration to trigger proactive refresh (5 minutes) */
  REFRESH_THRESHOLD: 5 * 60,
  /** Warning threshold in seconds for client-side indicator (2 minutes) */
  WARNING_THRESHOLD: 2 * 60,
} as const;

/**
 * Cookie names used throughout the application
 */
export const COOKIE_NAMES = ENV_COOKIE_NAMES;

/**
 * Token expiration info
 */
export type TokenExpirationInfo = {
  expiresAt: number;
  remainingSeconds: number;
  isExpired: boolean;
  shouldRefresh: boolean;
  shouldWarn: boolean;
};

export function getTokenExpirationFromTimestamp(expiresAtIso: string): TokenExpirationInfo | null {
  try {
    const date = new Date(expiresAtIso);
    if (isNaN(date.getTime())) return null;
    const expiresAt = Math.floor(date.getTime() / 1000);
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = expiresAt - now;
    return {
      expiresAt,
      remainingSeconds,
      isExpired: remainingSeconds <= 0,
      shouldRefresh: remainingSeconds > 0 && remainingSeconds < TOKEN_CONFIG.REFRESH_THRESHOLD,
      shouldWarn: remainingSeconds > 0 && remainingSeconds < TOKEN_CONFIG.WARNING_THRESHOLD,
    };
  } catch {
    return null;
  }
}

export function isTokenExpiredByTimestamp(expiresAtIso: string | null | undefined): boolean {
  if (!expiresAtIso) return true;
  const info = getTokenExpirationFromTimestamp(expiresAtIso);
  return info?.isExpired ?? true;
}

export function shouldRefreshByTimestamp(expiresAtIso: string | null | undefined): boolean {
  if (!expiresAtIso) return false;
  const info = getTokenExpirationFromTimestamp(expiresAtIso);
  return info?.shouldRefresh ?? false;
}

export function calculateExpirationTimestamp(
  expiresIn: number = TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
): number {
  return Math.floor(Date.now() / 1000) + expiresIn;
}

export function formatExpirationForCookie(expiresAt: number): string {
  return new Date(expiresAt * 1000).toISOString();
}

export function parseExpirationFromCookie(cookieValue: string): number | null {
  try {
    const date = new Date(cookieValue);
    if (isNaN(date.getTime())) {
      return null;
    }
    return Math.floor(date.getTime() / 1000);
  } catch {
    return null;
  }
}

export function buildCookieOptions(isProduction: boolean) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  };

  return {
    accessToken: {
      ...baseOptions,
      maxAge: TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
    },
    refreshToken: {
      ...baseOptions,
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
    },
    expiresAt: {
      ...baseOptions,
      httpOnly: false,
      maxAge: TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
    },
  };
}
