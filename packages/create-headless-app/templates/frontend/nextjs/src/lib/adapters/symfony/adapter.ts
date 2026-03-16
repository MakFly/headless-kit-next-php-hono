/**
 * Symfony adapter for BFF authentication
 *
 * Uses Bearer token authentication with BetterAuth
 */

import type {
  AdapterConfig,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
} from '../types';
import { BaseAdapter, AdapterError } from '../base-adapter';
import {
  transformAuthResponse,
  transformMeResponse,
  transformOAuthProviders,
  transformOAuthRedirect,
} from './transformer';

const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  ME: '/auth/me',
  OAUTH_PROVIDERS: '/auth/oauth/providers',
  OAUTH_REDIRECT: (provider: string) => `/auth/oauth/${provider}/redirect`,
};

export type SymfonyAdapterConfig = AdapterConfig;

export class SymfonyAdapter extends BaseAdapter {
  constructor(config: Partial<SymfonyAdapterConfig> = {}) {
    const fullConfig: SymfonyAdapterConfig = {
      baseUrl: process.env.SYMFONY_API_URL || 'http://localhost:8002',
      timeout: 30000,
      ...config,
    };
    super(fullConfig);
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown;
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    }>('POST', ENDPOINTS.LOGIN, {
      body: credentials,
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);
    await this.storeTokens(authResponse.tokens);
    return authResponse;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const registrationData: Record<string, string> = {
      name: data.name,
      email: data.email,
      password: data.password,
    };

    const response = await this.makeRequest<{
      user: unknown;
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    }>('POST', ENDPOINTS.REGISTER, {
      body: registrationData,
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);
    await this.storeTokens(authResponse.tokens);
    return authResponse;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('POST', ENDPOINTS.LOGOUT);
    } finally {
      await this.clearTokens();
    }
  }

  async refresh(request?: RefreshTokenRequest): Promise<AuthResponse> {
    const refreshToken = request?.refresh_token || (await this.getRefreshToken());

    if (!refreshToken) {
      throw new AdapterError('No refresh token available', 401, 'NO_REFRESH_TOKEN');
    }

    const response = await this.makeRequest<{
      user: unknown;
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      token_type?: string;
    }>('POST', ENDPOINTS.REFRESH, {
      body: { refresh_token: refreshToken },
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);
    await this.storeTokens(authResponse.tokens);
    return authResponse;
  }

  async getUser(): Promise<NormalizedUser | null> {
    try {
      const response = await this.makeRequest<unknown>('GET', ENDPOINTS.ME);
      return transformMeResponse(response as never);
    } catch (error) {
      if (error instanceof AdapterError) {
        if (error.statusCode === 401 || error.statusCode === 403) {
          return null;
        }
      }
      throw error;
    }
  }

  async getOAuthProviders(): Promise<string[]> {
    try {
      const response = await this.makeRequest<{ providers: string[] } | string[]>(
        'GET',
        ENDPOINTS.OAUTH_PROVIDERS,
        { includeAuth: false }
      );
      return transformOAuthProviders(response);
    } catch {
      return [];
    }
  }

  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<{ url: string } | { redirect_url: string }>(
      'GET',
      ENDPOINTS.OAUTH_REDIRECT(provider),
      { includeAuth: false }
    );
    return transformOAuthRedirect(response);
  }
}
