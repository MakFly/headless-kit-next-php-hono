/**
 * Security middleware
 */

import { createMiddleware } from 'hono/factory';
import type { AppVariables } from '../types/index.ts';

const REQUEST_ID_HEADER = 'x-request-id';

type RateLimitOptions = {
  scope: string;
  maxAttempts: number;
  windowSeconds: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

/**
 * In-memory rate limit store.
 * WARNING: Resets on process restart. Not suitable for horizontal scaling.
 * For multi-instance production deployments, replace with a Redis-backed store.
 */
const rateLimitStore = new Map<string, RateLimitEntry>();

function setNoStoreHeaders(headers: Headers): void {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
}

function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return headers.get('x-real-ip') || 'unknown';
}

function clearExpiredRateLimitEntries(now: number): void {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

export const requestContextMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const incomingRequestId = c.req.header(REQUEST_ID_HEADER);
    const requestId = incomingRequestId || crypto.randomUUID();

    c.set('requestId', requestId);

    await next();

    c.res.headers.set(REQUEST_ID_HEADER, requestId);
  }
);

export const noStoreMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    await next();
    setNoStoreHeaders(c.res.headers);
  }
);

export function rateLimitMiddleware(options: RateLimitOptions) {
  return createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    if (process.env.NODE_ENV === 'test') {
      return next();
    }

    const now = Date.now();
    clearExpiredRateLimitEntries(now);

    const ip = getClientIp(c.req.raw.headers);
    const requestId = c.get('requestId');
    const resetAt = now + options.windowSeconds * 1000;
    const key = `${options.scope}:${ip}`;

    const current = rateLimitStore.get(key);
    const count = (current?.count || 0) + 1;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil(((current?.resetAt || resetAt) - now) / 1000)
    );

    if (count > options.maxAttempts) {
      const headers = new Headers({
        [REQUEST_ID_HEADER]: requestId,
        'Retry-After': String(retryAfterSeconds),
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      });
      setNoStoreHeaders(headers);

      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many attempts. Please try again later.',
          },
          status: 429,
          request_id: requestId,
        }),
        { status: 429, headers }
      );
    }

    rateLimitStore.set(key, {
      count,
      resetAt: current?.resetAt || resetAt,
    });

    await next();
  });
}
