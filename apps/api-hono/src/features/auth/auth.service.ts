/**
 * Authentication service
 */

import * as authRepository from './auth.repository.ts';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getAccessTokenExpiration,
  getRefreshTokenExpirationDate,
} from '../../shared/lib/index.ts';
import { AppError } from '../../shared/lib/errors.ts';
import type { AuthResponse, SafeUser, Role } from '../../shared/types/index.ts';

/**
 * Register a new user
 */
export async function register(data: {
  email: string;
  name: string;
  password: string;
}): Promise<AuthResponse> {
  const exists = await authRepository.emailExists(data.email);
  if (exists) {
    throw new AppError('Email already registered', 'EMAIL_EXISTS', 409);
  }

  const passwordHash = await hashPassword(data.password);

  const user = await authRepository.createUser({
    email: data.email,
    name: data.name,
    passwordHash,
  });

  const userWithRoles = await authRepository.findWithRoles(user.id);

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user.id);

  await authRepository.createToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: getRefreshTokenExpirationDate(),
  });

  return {
    user: userWithRoles || { ...user, roles: [] },
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenExpiration(),
    tokenType: 'Bearer',
  };
}

/**
 * Login a user
 */
export async function login(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const user = await authRepository.findByEmail(data.email);
  if (!user) {
    throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
  }

  const valid = await verifyPassword(data.password, user.passwordHash);
  if (!valid) {
    throw new AppError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
  }

  const userWithRoles = await authRepository.findWithRoles(user.id);

  const safeUser: SafeUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerifiedAt: user.emailVerifiedAt,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  const accessToken = await generateAccessToken(safeUser);
  const refreshToken = await generateRefreshToken(user.id);

  await authRepository.createToken({
    userId: user.id,
    token: refreshToken,
    expiresAt: getRefreshTokenExpirationDate(),
  });

  return {
    user: userWithRoles || { ...safeUser, roles: [] },
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenExpiration(),
    tokenType: 'Bearer',
  };
}

/**
 * Refresh access token
 */
export async function refresh(refreshToken: string): Promise<AuthResponse> {
  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) {
    throw new AppError('Invalid refresh token', 'INVALID_TOKEN', 401);
  }

  const tokenValid = await authRepository.isTokenValid(refreshToken);
  if (!tokenValid) {
    throw new AppError('Refresh token expired or revoked', 'TOKEN_EXPIRED', 401);
  }

  const user = await authRepository.findWithRoles(userId);
  if (!user) {
    throw new AppError('User not found', 'USER_NOT_FOUND', 401);
  }

  await authRepository.deleteTokenByValue(refreshToken);

  const newAccessToken = await generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user.id);

  await authRepository.createToken({
    userId: user.id,
    token: newRefreshToken,
    expiresAt: getRefreshTokenExpirationDate(),
  });

  return {
    user,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresIn: getAccessTokenExpiration(),
    tokenType: 'Bearer',
  };
}

/**
 * Logout user (revoke refresh token)
 */
export async function logout(refreshToken?: string, userId?: string): Promise<void> {
  if (refreshToken) {
    await authRepository.deleteTokenByValue(refreshToken);
  } else if (userId) {
    await authRepository.deleteTokensByUserId(userId);
  }
}

/**
 * Get current user by ID
 */
export async function getCurrentUser(
  userId: string
): Promise<(SafeUser & { roles: Role[] }) | null> {
  return authRepository.findWithRoles(userId);
}

/**
 * Forgot password — creates a reset token if user exists
 */
export async function forgotPassword(email: string): Promise<void> {
  const user = await authRepository.findByEmail(email);
  if (!user) return; // Silent — no email enumeration

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

  await authRepository.createPasswordResetToken({
    userId: user.id,
    token,
    expiresAt,
  });
  // In production, send email with token here
}

/**
 * Verify a password reset token
 */
export async function verifyResetToken(token: string): Promise<boolean> {
  const record = await authRepository.findPasswordResetToken(token);
  if (!record) return false;
  if (record.usedAt) return false;
  return new Date(record.expiresAt) > new Date();
}

/**
 * Reset password using a valid token
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const record = await authRepository.findPasswordResetToken(token);
  if (!record || record.usedAt || new Date(record.expiresAt) <= new Date()) {
    throw new AppError('Invalid or expired reset token', 'INVALID_TOKEN', 400);
  }

  const passwordHash = await hashPassword(newPassword);
  await authRepository.updateUserPassword(record.userId, passwordHash);
  await authRepository.markPasswordResetTokenUsed(record.id);
}
