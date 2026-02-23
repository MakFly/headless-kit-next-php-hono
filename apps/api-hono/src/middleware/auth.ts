/**
 * Authentication middleware
 */

import { createMiddleware } from 'hono/factory';
import type { Context } from 'hono';
import { verifyToken } from '../lib/jwt.ts';
import { userRepository } from '../repositories/index.ts';
import type { AppVariables, SafeUser, JwtPayload } from '../types/index.ts';

/**
 * Extract Bearer token from Authorization header
 */
function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Auth middleware - requires authentication
 */
export const authMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const requestId = c.get('requestId');
    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    if (!token) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'No token provided',
          code: 'UNAUTHORIZED',
          status: 401,
          request_id: requestId,
        },
        401
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired token',
          code: 'UNAUTHORIZED',
          status: 401,
          request_id: requestId,
        },
        401
      );
    }

    // Get user from database
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      return c.json(
        {
          error: 'Unauthorized',
          message: 'User not found',
          code: 'UNAUTHORIZED',
          status: 401,
          request_id: requestId,
        },
        401
      );
    }

    // Set user in context
    c.set('user', user);
    c.set('jwtPayload', payload);

    await next();
  }
);

/**
 * Optional auth middleware - doesn't require authentication but parses token if present
 */
export const optionalAuthMiddleware = createMiddleware<{ Variables: AppVariables }>(
  async (c, next) => {
    const authHeader = c.req.header('Authorization');
    const token = extractToken(authHeader);

    c.set('user', null);
    c.set('jwtPayload', null);

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const user = await userRepository.findById(payload.sub);
        if (user) {
          c.set('user', user);
          c.set('jwtPayload', payload);
        }
      }
    }

    await next();
  }
);

/**
 * Get current user from context
 */
export function getUser(c: Context<{ Variables: AppVariables }>): SafeUser | null {
  return c.get('user');
}

/**
 * Get JWT payload from context
 */
export function getJwtPayload(c: Context<{ Variables: AppVariables }>): JwtPayload | null {
  return c.get('jwtPayload');
}

/**
 * Require user to be authenticated (throws if not)
 */
export function requireUser(c: Context<{ Variables: AppVariables }>): SafeUser {
  const user = c.get('user');
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user;
}
