import { describe, test, expect, beforeEach } from 'bun:test'

import {
  isAuthRoute,
  checkRateLimit,
  resetRateLimits,
  validatePathSegments,
} from '../proxy-utils'

describe('isAuthRoute', () => {
  test('matches login route', () => {
    expect(isAuthRoute('/api/v1/auth/login')).toBe(true)
  })

  test('matches register route', () => {
    expect(isAuthRoute('/api/v1/auth/register')).toBe(true)
  })

  test('matches refresh route', () => {
    expect(isAuthRoute('/api/v1/auth/refresh')).toBe(true)
  })

  test('matches logout route', () => {
    expect(isAuthRoute('/api/v1/auth/logout')).toBe(true)
  })

  test('matches forgot-password route', () => {
    expect(isAuthRoute('/api/v1/auth/forgot-password')).toBe(true)
  })

  test('matches reset-password route', () => {
    expect(isAuthRoute('/api/v1/auth/reset-password')).toBe(true)
  })

  test('matches two-factor/enable', () => {
    expect(isAuthRoute('/api/v1/auth/two-factor/enable')).toBe(true)
  })

  test('matches two-factor/verify', () => {
    expect(isAuthRoute('/api/v1/auth/two-factor/verify')).toBe(true)
  })

  test('matches two-factor/disable', () => {
    expect(isAuthRoute('/api/v1/auth/two-factor/disable')).toBe(true)
  })

  test('matches two-factor/recover', () => {
    expect(isAuthRoute('/api/v1/auth/two-factor/recover')).toBe(true)
  })

  test('matches two-factor/recovery (Hono path)', () => {
    expect(isAuthRoute('/api/v1/auth/two-factor/recovery')).toBe(true)
  })

  test('matches magic-link/check', () => {
    expect(isAuthRoute('/api/v1/auth/magic-link/check')).toBe(true)
  })

  test('matches magic-link/verify', () => {
    expect(isAuthRoute('/api/v1/auth/magic-link/verify')).toBe(true)
  })

  test('does NOT match /auth/me', () => {
    expect(isAuthRoute('/api/v1/auth/me')).toBe(false)
  })

  test('does NOT match shop products', () => {
    expect(isAuthRoute('/api/v1/shop/products')).toBe(false)
  })

  test('does NOT match admin endpoints', () => {
    expect(isAuthRoute('/api/v1/admin/products')).toBe(false)
  })

  test('handles trailing slashes', () => {
    expect(isAuthRoute('/api/v1/auth/login/')).toBe(true)
  })

  test('handles path without /api/v1/ prefix', () => {
    expect(isAuthRoute('auth/login')).toBe(true)
  })

  test('handles path with leading slash only', () => {
    expect(isAuthRoute('/auth/register')).toBe(true)
  })

  test('returns false for empty string', () => {
    expect(isAuthRoute('')).toBe(false)
  })
})

describe('validatePathSegments', () => {
  test('accepts valid alphanumeric segments', () => {
    expect(() => validatePathSegments(['auth', 'login'])).not.toThrow()
  })

  test('accepts segments with dashes', () => {
    expect(() => validatePathSegments(['forgot-password'])).not.toThrow()
    expect(() => validatePathSegments(['order-items'])).not.toThrow()
  })

  test('accepts segments with underscores', () => {
    expect(() => validatePathSegments(['two_factor', 'verify'])).not.toThrow()
  })

  test('accepts single-character segments', () => {
    expect(() => validatePathSegments(['a'])).not.toThrow()
  })

  test('accepts numeric segments', () => {
    expect(() => validatePathSegments(['123', '456'])).not.toThrow()
  })

  test('rejects empty segments', () => {
    expect(() => validatePathSegments([''])).toThrow('empty segment')
    expect(() => validatePathSegments(['auth', ''])).toThrow('empty segment')
  })

  test('rejects double-dot path traversal', () => {
    expect(() => validatePathSegments(['..'])).toThrow('traversal')
    expect(() => validatePathSegments(['auth', '..', 'admin'])).toThrow('traversal')
  })

  test('rejects single-dot path traversal', () => {
    expect(() => validatePathSegments(['.'])).toThrow('traversal')
  })

  test('rejects absolute URLs with protocol', () => {
    expect(() => validatePathSegments(['http://evil.com'])).toThrow('absolute URLs')
    expect(() => validatePathSegments(['https://evil.com'])).toThrow('absolute URLs')
  })

  test('rejects protocol-relative URLs', () => {
    expect(() => validatePathSegments(['//evil.com'])).toThrow('absolute URLs')
  })

  test('rejects slashes within a segment', () => {
    expect(() => validatePathSegments(['auth/login'])).toThrow('forbidden characters')
  })

  test('rejects dots in segments', () => {
    expect(() => validatePathSegments(['file.txt'])).toThrow('forbidden characters')
  })

  test('rejects spaces', () => {
    expect(() => validatePathSegments(['hello world'])).toThrow('forbidden characters')
  })

  test('rejects HTML/script characters', () => {
    expect(() => validatePathSegments(['<script>'])).toThrow('forbidden characters')
  })

  test('rejects special characters', () => {
    expect(() => validatePathSegments(['@user'])).toThrow('forbidden characters')
    expect(() => validatePathSegments(['foo&bar'])).toThrow('forbidden characters')
    expect(() => validatePathSegments(['foo=bar'])).toThrow('forbidden characters')
  })

  test('accepts multi-segment valid paths', () => {
    expect(() => validatePathSegments(['shop', 'products', '123'])).not.toThrow()
    expect(() => validatePathSegments(['auth', 'two-factor', 'verify'])).not.toThrow()
  })
})

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  test('allows first request on auth route', () => {
    expect(checkRateLimit('1.2.3.4', '/api/v1/auth/login')).toBe(true)
  })

  test('allows non-auth routes without limit', () => {
    for (let i = 0; i < 100; i++) {
      expect(checkRateLimit('1.2.3.4', '/api/v1/shop/products')).toBe(true)
    }
  })

  test('blocks after 20 auth requests from same IP', () => {
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit('1.2.3.4', '/api/v1/auth/login')).toBe(true)
    }
    expect(checkRateLimit('1.2.3.4', '/api/v1/auth/login')).toBe(false)
  })

  test('different IPs have separate limits', () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit('1.2.3.4', '/api/v1/auth/login')
    }
    expect(checkRateLimit('1.2.3.4', '/api/v1/auth/login')).toBe(false)
    expect(checkRateLimit('5.6.7.8', '/api/v1/auth/login')).toBe(true)
  })

  test('counts across different auth endpoints for same IP', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('1.2.3.4', '/api/v1/auth/login')
    }
    for (let i = 0; i < 10; i++) {
      checkRateLimit('1.2.3.4', '/api/v1/auth/register')
    }
    expect(checkRateLimit('1.2.3.4', '/api/v1/auth/refresh')).toBe(false)
  })

  test('resetRateLimits clears all limits', () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit('1.2.3.4', '/api/v1/auth/login')
    }
    expect(checkRateLimit('1.2.3.4', '/api/v1/auth/login')).toBe(false)

    resetRateLimits()

    expect(checkRateLimit('1.2.3.4', '/api/v1/auth/login')).toBe(true)
  })

  test('does not rate limit non-auth paths regardless of count', () => {
    for (let i = 0; i < 50; i++) {
      expect(checkRateLimit('1.2.3.4', '/api/v1/admin/users')).toBe(true)
    }
  })
})
