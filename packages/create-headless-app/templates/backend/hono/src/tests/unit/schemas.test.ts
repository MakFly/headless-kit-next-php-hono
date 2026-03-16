/**
 * Unit tests for validation schemas
 */

import { describe, it, expect } from 'bun:test';
import { loginSchema, registerSchema, refreshSchema } from '../../features/auth/auth.schemas.ts';

describe('Validation Schemas', () => {
  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should reject empty email', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      });

      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });

      expect(result.success).toBe(false);
    });

    it('should reject missing fields', () => {
      const result = loginSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
      });

      expect(result.success).toBe(true);
    });

    it('should validate with password confirmation', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        password_confirmation: 'securePassword123',
      });

      expect(result.success).toBe(true);
    });

    it('should reject mismatched password confirmation', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        password_confirmation: 'differentPassword',
      });

      expect(result.success).toBe(false);
    });

    it('should reject short name', () => {
      const result = registerSchema.safeParse({
        name: 'J',
        email: 'john@example.com',
        password: 'securePassword123',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name');
      }
    });

    it('should reject short password', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'short',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('should reject invalid email', () => {
      const result = registerSchema.safeParse({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'securePassword123',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('refreshSchema', () => {
    it('should validate with refreshToken', () => {
      const result = refreshSchema.safeParse({
        refreshToken: 'some-token-value',
      });

      expect(result.success).toBe(true);
    });

    it('should validate with refresh_token (snake_case)', () => {
      const result = refreshSchema.safeParse({
        refresh_token: 'some-token-value',
      });

      expect(result.success).toBe(true);
    });

    it('should reject when both tokens are missing', () => {
      const result = refreshSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it('should accept when either token format is provided', () => {
      const result1 = refreshSchema.safeParse({ refreshToken: 'token' });
      const result2 = refreshSchema.safeParse({ refresh_token: 'token' });

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });
});
