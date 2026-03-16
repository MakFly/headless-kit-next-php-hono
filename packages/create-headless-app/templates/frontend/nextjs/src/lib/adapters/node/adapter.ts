/**
 * Node.js adapter for BFF authentication
 *
 * Generic adapter compatible with Hono, Express, Fastify, and other Node.js frameworks
 * Uses Bearer token authentication
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

function buildEndpoints(prefix: string) {
  return {
    LOGIN: `${prefix}/login`,
    REGISTER: `${prefix}/register`,
    LOGOUT: `${prefix}/logout`,
    REFRESH: `${prefix}/refresh`,
    ME: `${prefix}/me`,
    OAUTH_PROVIDERS: `${prefix}/oauth/providers`,
    OAUTH_REDIRECT: (provider: string) => `${prefix}/oauth/${provider}/redirect`,
  };
}

export type NodeAdapterConfig = AdapterConfig & {
  authPrefix?: string;
};

export class NodeAdapter extends BaseAdapter {
  protected override config: NodeAdapterConfig;
  private endpoints: ReturnType<typeof buildEndpoints>;

  constructor(config: Partial<NodeAdapterConfig> = {}) {
    const fullConfig: NodeAdapterConfig = {
      baseUrl: process.env.NODE_API_URL || 'http://localhost:8003',
      timeout: 30000,
      authPrefix: config.authPrefix || process.env.NODE_AUTH_PREFIX || '/api/auth',
      ...config,
    };
    super(fullConfig);
    this.config = fullConfig;
    this.endpoints = buildEndpoints(this.config.authPrefix!);
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown;
      accessToken?: string;
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
      expiresIn?: number;
      expires_in?: number;
      tokenType?: string;
      token_type?: string;
    }>('POST', this.endpoints.LOGIN, {
      body: credentials,
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);
    await this.storeTokens(authResponse.tokens);
    return authResponse;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown;
      accessToken?: string;
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
      expiresIn?: number;
      expires_in?: number;
      tokenType?: string;
      token_type?: string;
    }>('POST', this.endpoints.REGISTER, {
      body: data,
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);
    await this.storeTokens(authResponse.tokens);
    return authResponse;
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('POST', this.endpoints.LOGOUT);
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
      accessToken?: string;
      access_token?: string;
      refreshToken?: string;
      refresh_token?: string;
      expiresIn?: number;
      expires_in?: number;
      tokenType?: string;
      token_type?: string;
    }>('POST', this.endpoints.REFRESH, {
      body: { refreshToken, refresh_token: refreshToken },
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);
    await this.storeTokens(authResponse.tokens);
    return authResponse;
  }

  async getUser(): Promise<NormalizedUser | null> {
    try {
      const response = await this.makeRequest<unknown>('GET', this.endpoints.ME);
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
      const response = await this.makeRequest<{ providers: string[] } | string[] | { data: string[] }>(
        'GET',
        this.endpoints.OAUTH_PROVIDERS,
        { includeAuth: false }
      );
      return transformOAuthProviders(response);
    } catch {
      return [];
    }
  }

  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<
      { url: string } | { redirectUrl: string } | { redirect_url: string }
    >('GET', this.endpoints.OAUTH_REDIRECT(provider), { includeAuth: false });
    return transformOAuthRedirect(response);
  }
}
