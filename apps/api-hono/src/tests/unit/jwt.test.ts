/**
 * Unit tests for JWT utilities
 */

import { describe, it, expect } from 'bun:test';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  verifyRefreshToken,
  getAccessTokenExpiration,
  getRefreshTokenExpiration,
} from '../../lib/jwt.ts';
import type { SafeUser } from '../../types/index.ts';

describe('JWT Utilities', () => {
  const mockUser: SafeUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerifiedAt: null,
    avatarUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('getAccessTokenExpiration', () => {
    it('should return default expiration', () => {
      const exp = getAccessTokenExpiration();
      expect(exp).toBe(3600); // 1 hour default
    });
  });

  describe('getRefreshTokenExpiration', () => {
    it('should return configured expiration', () => {
      const exp = getRefreshTokenExpiration();
      const expected = parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '604800', 10);
      expect(exp).toBe(expected);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT', async () => {
      const token = await generateAccessToken(mockUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should include user data in payload', async () => {
      const token = await generateAccessToken(mockUser);
      const payload = await verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(mockUser.id);
      expect(payload?.email).toBe(mockUser.email);
      expect(payload?.name).toBe(mockUser.name);
    });

    it('should set expiration time', async () => {
      const token = await generateAccessToken(mockUser);
      const payload = await verifyToken(token);

      expect(payload?.exp).toBeDefined();
      expect(payload?.iat).toBeDefined();
      expect(payload!.exp).toBeGreaterThan(payload!.iat);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', async () => {
      const token = await generateRefreshToken(mockUser.id);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3);
    });

    it('should be verifiable as refresh token', async () => {
      const token = await generateRefreshToken(mockUser.id);
      const userId = await verifyRefreshToken(token);

      expect(userId).toBe(mockUser.id);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid access token', async () => {
      const token = await generateAccessToken(mockUser);
      const payload = await verifyToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(mockUser.id);
    });

    it('should return null for invalid token', async () => {
      const payload = await verifyToken('invalid.token.here');

      expect(payload).toBeNull();
    });

    it('should return null for malformed token', async () => {
      const payload = await verifyToken('not-a-jwt');

      expect(payload).toBeNull();
    });

    it('should return null for empty string', async () => {
      const payload = await verifyToken('');

      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify valid refresh token', async () => {
      const token = await generateRefreshToken(mockUser.id);
      const userId = await verifyRefreshToken(token);

      expect(userId).toBe(mockUser.id);
    });

    it('should return null for access token (wrong type)', async () => {
      const accessToken = await generateAccessToken(mockUser);
      const userId = await verifyRefreshToken(accessToken);

      expect(userId).toBeNull();
    });

    it('should return null for invalid token', async () => {
      const userId = await verifyRefreshToken('invalid.token');

      expect(userId).toBeNull();
    });
  });
});
