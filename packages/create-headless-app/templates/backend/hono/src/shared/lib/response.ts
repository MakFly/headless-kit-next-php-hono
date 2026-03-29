/**
 * Standardized API response helpers.
 *
 * All API responses follow the envelope format:
 *
 * Success: { success: true, data, meta?, status, request_id }
 * Error:   { success: false, error: { code, message, details? }, status, request_id }
 */

import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-types';

function generateRequestId(): string {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/**
 * Return a standardized success response.
 */
export function apiSuccess(
  c: Context,
  data: unknown,
  meta?: Record<string, unknown>,
  status: number = 200
): Response {
  const requestId = (c.get('requestId') as string | undefined) ?? generateRequestId();
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  c.header('X-Request-Id', requestId);

  const body: Record<string, unknown> = {
    success: true,
    data,
    status,
    request_id: requestId,
  };

  if (meta !== undefined) {
    body.meta = meta;
  }

  return c.json(body, status as StatusCode);
}

/**
 * Return a standardized error response.
 */
export function apiError(
  c: Context,
  code: string,
  message: string,
  status: number,
  details?: unknown
): Response {
  const requestId = (c.get('requestId') as string | undefined) ?? generateRequestId();
  c.header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  c.header('X-Request-Id', requestId);

  const errorBody: Record<string, unknown> = { code, message };
  if (details !== undefined) {
    errorBody.details = details;
  }

  return c.json(
    {
      success: false,
      error: errorBody,
      status,
      request_id: requestId,
    },
    status as StatusCode
  );
}
