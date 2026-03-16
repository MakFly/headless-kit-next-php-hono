/**
 * JWT utilities using jose
 */

import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { nanoid } from 'nanoid';
import type { JwtPayload, SafeUser } from '../types/index.ts';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret');
const JWT_ALGORITHM = 'HS256';

/**
 * Get access token expiration in seconds
 */
export function getAccessTokenExpiration(): number {
  return parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '3600', 10);
}

/**
 * Get refresh token expiration in seconds
 */
export function getRefreshTokenExpiration(): number {
  return parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10);
}

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(user: SafeUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = getAccessTokenExpiration();

  return new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Generate a refresh token
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = getRefreshTokenExpiration();

  return new SignJWT({
    sub: userId,
    type: 'refresh',
    jti: nanoid(), // Unique token ID to prevent collisions
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt(now)
    .setExpirationTime(now + expiresIn)
    .sign(JWT_SECRET);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    return {
      sub: payload.sub as string,
      email: (payload as JWTPayload & { email?: string }).email || '',
      name: (payload as JWTPayload & { name?: string }).name || '',
      iat: payload.iat || 0,
      exp: payload.exp || 0,
    };
  } catch {
    return null;
  }
}

/**
 * Verify a refresh token and return the user ID
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: [JWT_ALGORITHM],
    });

    if ((payload as JWTPayload & { type?: string }).type !== 'refresh') {
      return null;
    }

    return payload.sub as string;
  } catch {
    return null;
  }
}

/**
 * Calculate token expiration date
 */
export function getRefreshTokenExpirationDate(): Date {
  const expiresIn = getRefreshTokenExpiration();
  return new Date(Date.now() + expiresIn * 1000);
}
