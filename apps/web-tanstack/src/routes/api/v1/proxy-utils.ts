/**
 * Pure utility functions for the BFF proxy.
 * Extracted for testability — no TanStack or framework imports.
 */

import { ApiException } from '@/lib/http'

/**
 * Regex to validate path segments (alphanumerics, dashes, underscores only)
 */
const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/

/**
 * Routes that require response buffering for token extraction.
 * All other routes use streaming pass-through.
 */
const AUTH_ROUTES = new Set([
  'auth/login', 'auth/register', 'auth/refresh', 'auth/logout',
  'auth/forgot-password', 'auth/reset-password',
  'auth/two-factor/enable', 'auth/two-factor/verify',
  'auth/two-factor/disable', 'auth/two-factor/recover',
  'auth/two-factor/recovery',
  'auth/magic-link/check', 'auth/magic-link/verify',
])

export function isAuthRoute(path: string): boolean {
  const normalized = path.replace(/^\/api\/v1\//, '').replace(/^\/+/, '').replace(/\/+$/, '')
  return AUTH_ROUTES.has(normalized)
}

/**
 * Simple in-memory sliding window rate limiter for auth endpoints.
 * In production, replace with Redis/Upstash for multi-instance deployments.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const RATE_LIMIT_MAX_AUTH = 20

export function checkRateLimit(ip: string, path: string): boolean {
  if (!isAuthRoute(path)) return true

  const key = `${ip}:auth`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX_AUTH) return false

  entry.count++
  return true
}

/**
 * Reset rate limit state — exposed for tests only.
 */
export function resetRateLimits(): void {
  rateLimitMap.clear()
}

/**
 * Validates path segments to prevent SSRF/Path Traversal attacks
 * @throws {ApiException} if path contains dangerous segments
 */
export function validatePathSegments(segments: Array<string>): void {
  for (const segment of segments) {
    if (!segment) {
      throw new ApiException('Invalid path: empty segment', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
    if (segment === '..' || segment === '.') {
      throw new ApiException('Invalid path: traversal not allowed', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
    if (segment.includes('://') || segment.startsWith('//')) {
      throw new ApiException('Invalid path: absolute URLs not allowed', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
    if (!SAFE_PATH_SEGMENT.test(segment)) {
      throw new ApiException('Invalid path: forbidden characters', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
  }
}
