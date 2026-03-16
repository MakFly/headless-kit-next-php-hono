/**
 * Server Actions for authentication
 */

'use server';

import type { User, LoginCredentials, RegisterData, AuthTokens, ApiResponse } from '@/types';
import { bffPost, bffGet } from '../_shared/bff-client';
import { AuthActionError } from '../_shared/errors';

export async function registerAction(
  data: RegisterData
): Promise<ApiResponse<{ user: User; access_token: string }>> {
  try {
    return await bffPost<ApiResponse<{ user: User; access_token: string }>>(
      '/api/v1/auth/register',
      data,
      { skipAuth: true }
    );
  } catch (error) {
    throw AuthActionError.fromUnknown(error);
  }
}

export async function loginAction(
  credentials: LoginCredentials
): Promise<ApiResponse<{ user: User; access_token: string }>> {
  try {
    return await bffPost<ApiResponse<{ user: User; access_token: string }>>(
      '/api/v1/auth/login',
      credentials,
      { skipAuth: true }
    );
  } catch (error) {
    throw AuthActionError.fromUnknown(error);
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await bffPost('/api/v1/auth/logout');
  } catch (error) {
    // Best effort logout
    console.error('Logout error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export async function refreshTokenAction(): Promise<ApiResponse<AuthTokens>> {
  try {
    return await bffPost<ApiResponse<AuthTokens>>('/api/v1/auth/refresh');
  } catch (error) {
    throw AuthActionError.fromUnknown(error);
  }
}

export async function getCurrentUserAction(): Promise<User | null> {
  try {
    const response = await bffGet<{ data: User }>('/api/v1/auth/me');
    return response.data;
  } catch (error) {
    if (error instanceof AuthActionError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return null;
      }
    }
    // For BffActionError or other errors with statusCode
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      if (statusCode === 401 || statusCode === 403) {
        return null;
      }
    }
    return null;
  }
}

export async function getOAuthUrlAction(provider: string): Promise<{ url: string }> {
  try {
    return await bffGet<{ url: string }>(`/api/v1/auth/oauth/${provider}/url`);
  } catch (error) {
    throw AuthActionError.fromUnknown(error);
  }
}

export { AuthActionError };
