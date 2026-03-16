import { COOKIE_NAMES as ENV_COOKIE_NAMES } from '@/lib/config/env'

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_MAX_AGE: 60 * 60,
  REFRESH_TOKEN_MAX_AGE: 60 * 60 * 24 * 30,
  REFRESH_THRESHOLD: 5 * 60,
  WARNING_THRESHOLD: 2 * 60,
} as const

export const COOKIE_NAMES = ENV_COOKIE_NAMES

export type TokenExpirationInfo = {
  expiresAt: number
  remainingSeconds: number
  isExpired: boolean
  shouldRefresh: boolean
  shouldWarn: boolean
}

export function getTokenExpirationFromTimestamp(expiresAtIso: string): TokenExpirationInfo | null {
  try {
    const date = new Date(expiresAtIso)
    if (isNaN(date.getTime())) return null
    const expiresAt = Math.floor(date.getTime() / 1000)
    const now = Math.floor(Date.now() / 1000)
    const remainingSeconds = expiresAt - now
    return {
      expiresAt,
      remainingSeconds,
      isExpired: remainingSeconds <= 0,
      shouldRefresh: remainingSeconds > 0 && remainingSeconds < TOKEN_CONFIG.REFRESH_THRESHOLD,
      shouldWarn: remainingSeconds > 0 && remainingSeconds < TOKEN_CONFIG.WARNING_THRESHOLD,
    }
  } catch {
    return null
  }
}

export function isTokenExpiredByTimestamp(expiresAtIso: string | null | undefined): boolean {
  if (!expiresAtIso) return true
  const info = getTokenExpirationFromTimestamp(expiresAtIso)
  return info?.isExpired ?? true
}

export function shouldRefreshByTimestamp(expiresAtIso: string | null | undefined): boolean {
  if (!expiresAtIso) return false
  const info = getTokenExpirationFromTimestamp(expiresAtIso)
  return info?.shouldRefresh ?? false
}

export function calculateExpirationTimestamp(
  expiresIn: number = TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
): number {
  return Math.floor(Date.now() / 1000) + expiresIn
}

export function formatExpirationForCookie(expiresAt: number): string {
  return new Date(expiresAt * 1000).toISOString()
}

export function parseExpirationFromCookie(cookieValue: string): number | null {
  try {
    const date = new Date(cookieValue)
    if (isNaN(date.getTime())) return null
    return Math.floor(date.getTime() / 1000)
  } catch {
    return null
  }
}

export function buildCookieOptions(isProduction: boolean) {
  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  }
  return {
    accessToken: { ...baseOptions, maxAge: TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE },
    refreshToken: { ...baseOptions, maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE },
    expiresAt: { ...baseOptions, httpOnly: false, maxAge: TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE },
  }
}
