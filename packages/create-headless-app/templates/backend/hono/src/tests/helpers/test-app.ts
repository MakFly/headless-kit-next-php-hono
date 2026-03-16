/**
 * Test app factory — creates a Hono app with AppError handler for integration tests.
 */

import { Hono } from 'hono';
import { AppError } from '../../shared/lib/errors.ts';
import { apiError } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

/**
 * Creates a Hono app with the standard onError handler that processes AppError.
 * Use this in integration tests to ensure AppError propagates correctly.
 */
export function createTestApp(): Hono<{ Variables: AppVariables }> {
  const app = new Hono<{ Variables: AppVariables }>();

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return apiError(c, err.code, err.message, err.statusCode, err.details);
    }
    console.error('Test unhandled error:', err);
    return apiError(c, 'INTERNAL_ERROR', err.message, 500);
  });

  return app;
}
