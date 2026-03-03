/**
 * Laravel adapter for BFF authentication
 *
 * Uses HMAC signing for secure server-to-server communication
 */

import type {
  AdapterConfig,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
} from "../types";
import { BaseAdapter, AdapterError } from "../base-adapter";
import { generateSignature, BFF_SECRET, BFF_ID } from "../../security/hmac";
import { apiRequestJson } from "../../http/api-request";
import {
  transformAuthResponse,
  transformMeResponse,
  transformOAuthProviders,
  transformOAuthRedirect,
} from "./transformer";

/**
 * Laravel API endpoints (BetterAuth)
 */
const ENDPOINTS = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",
  ME: "/api/auth/me",
  OAUTH_PROVIDERS: "/api/auth/oauth/providers",
  OAUTH_REDIRECT: (provider: string) => `/api/auth/oauth/${provider}`,
  TWO_FACTOR_STATUS: "/api/auth/2fa/status",
  TWO_FACTOR_SETUP: "/api/auth/2fa/setup",
  TWO_FACTOR_VERIFY: "/api/auth/2fa/verify",
  TWO_FACTOR_DISABLE: "/api/auth/2fa/disable",
  MAGIC_LINK: "/api/auth/magic-link",
};

/**
 * Laravel adapter configuration
 */
export type LaravelAdapterConfig = AdapterConfig & {
  secret: string;
  bffId: string;
};

/**
 * Laravel adapter class
 *
 * Implements HMAC-signed requests to Laravel backend
 */
export class LaravelAdapter extends BaseAdapter {
  protected override config: LaravelAdapterConfig;

  constructor(config: Partial<LaravelAdapterConfig> = {}) {
    const fullConfig: LaravelAdapterConfig = {
      baseUrl: process.env.LARAVEL_API_URL || "http://localhost:8000",
      timeout: 30000,
      secret: config.secret || BFF_SECRET,
      bffId: config.bffId || BFF_ID,
      ...config,
    };
    super(fullConfig);
    this.config = fullConfig;
  }

  /**
   * Override makeRequest to add HMAC signing
   */
  protected override async makeRequest<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      includeAuth?: boolean;
    } = {},
  ): Promise<T> {
    const { body, headers = {}, includeAuth = true } = options;

    // Generate HMAC signature
    const { normalizedBody, ...hmacHeaders } = generateSignature(
      method,
      path,
      body,
    );

    const url = `${this.config.baseUrl}${path}`;
    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...hmacHeaders,
      ...headers,
    };

    // Add Bearer token for authenticated requests
    if (includeAuth) {
      const token = await this.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    try {
      return await apiRequestJson<T>(url, {
        method,
        headers: requestHeaders,
        body: normalizedBody,
        timeoutMs: this.config.timeout,
      });
    } catch (error) {
      if (error instanceof AdapterError) {
        throw error;
      }
      throw AdapterError.fromUnknown(error);
    }
  }

  /**
   * Log in a user
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      data: {
        user: unknown;
        access_token: string;
        token_type?: string;
        expires_in?: number;
      };
    }>("POST", ENDPOINTS.LOGIN, {
      body: credentials,
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);

    // Store tokens in cookies
    await this.storeTokens(authResponse.tokens);

    return authResponse;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      data: {
        user: unknown;
        access_token: string;
        token_type?: string;
        expires_in?: number;
      };
    }>("POST", ENDPOINTS.REGISTER, {
      body: data,
      includeAuth: false,
    });

    const authResponse = transformAuthResponse(response as never);

    // Store tokens in cookies
    await this.storeTokens(authResponse.tokens);

    return authResponse;
  }

  /**
   * Log out the current user
   */
  async logout(): Promise<void> {
    try {
      await this.makeRequest("POST", ENDPOINTS.LOGOUT);
    } finally {
      // Always clear tokens, even if the request fails
      await this.clearTokens();
    }
  }

  /**
   * Refresh the access token
   */
  async refresh(request?: RefreshTokenRequest): Promise<AuthResponse> {
    const refreshToken =
      request?.refresh_token || (await this.getRefreshToken());

    const response = await this.makeRequest<{
      data: {
        user: unknown;
        access_token: string;
        token_type?: string;
        expires_in?: number;
      };
    }>("POST", ENDPOINTS.REFRESH, {
      body: refreshToken ? { refresh_token: refreshToken } : undefined,
    });

    const authResponse = transformAuthResponse(response as never);

    // Store new tokens in cookies
    await this.storeTokens(authResponse.tokens);

    return authResponse;
  }

  /**
   * Get the current authenticated user
   */
  async getUser(): Promise<NormalizedUser | null> {
    try {
      const response = await this.makeRequest<{ data: unknown }>(
        "GET",
        ENDPOINTS.ME,
      );
      return transformMeResponse(response as never);
    } catch (error) {
      if (error instanceof AdapterError) {
        // Not authenticated
        if (error.statusCode === 401 || error.statusCode === 403) {
          return null;
        }
      }
      throw error;
    }
  }

  /**
   * Get available OAuth providers
   */
  async getOAuthProviders(): Promise<string[]> {
    const response = await this.makeRequest<{ data: string[] }>(
      "GET",
      ENDPOINTS.OAUTH_PROVIDERS,
      { includeAuth: false },
    );
    return transformOAuthProviders(response);
  }

  /**
   * Get OAuth redirect URL for a provider
   */
  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<{ data: { redirect_url: string } }>(
      "GET",
      ENDPOINTS.OAUTH_REDIRECT(provider),
      { includeAuth: false },
    );
    return transformOAuthRedirect(response);
  }

  async sendMagicLink(email: string): Promise<void> {
    await this.makeRequest('POST', ENDPOINTS.MAGIC_LINK, {
      body: { email },
      includeAuth: false,
    });
  }
}
