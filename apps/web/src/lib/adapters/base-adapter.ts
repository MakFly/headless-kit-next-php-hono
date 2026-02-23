/**
 * Base adapter class for all backend auth adapters
 *
 * Provides common functionality for cookie management and HTTP requests
 */

import { cookies } from 'next/headers';
import type {
  AuthAdapter,
  AdapterConfig,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
  TokenStorage,
} from './types';
import {
  TOKEN_CONFIG,
  COOKIE_NAMES as TOKEN_COOKIE_NAMES,
  calculateExpirationTimestamp,
  formatExpirationForCookie,
} from '../services/token-service';
import { AdapterError } from './errors';
import { apiRequestJson } from '../http/api-request';

// Re-export AdapterError for backwards compatibility
export { AdapterError } from './errors';

/**
 * Base cookie configuration
 */
const BASE_COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

/**
 * Cookie names - re-exported from token service for convenience
 */
export const COOKIE_NAMES = TOKEN_COOKIE_NAMES;

/**
 * Default request timeout in milliseconds
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Base adapter class
 *
 * All backend-specific adapters extend this class
 */
export abstract class BaseAdapter implements AuthAdapter {
  protected config: AdapterConfig;

  constructor(config: AdapterConfig) {
    this.config = {
      timeout: DEFAULT_TIMEOUT,
      ...config,
    };
  }

  /**
   * Make an HTTP request to the backend
   */
  protected async makeRequest<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      includeAuth?: boolean;
    } = {}
  ): Promise<T> {
    const { body, headers = {}, includeAuth = true } = options;

    const url = `${this.config.baseUrl}${path}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    // Add auth header if needed
    if (includeAuth) {
      const authHeaders = await this.getAuthHeaders();
      Object.assign(requestHeaders, authHeaders);
    }

    try {
      return await apiRequestJson<T>(url, {
        method,
        headers: requestHeaders,
        body: body == null ? undefined : JSON.stringify(body),
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
   * Get headers for authenticated requests
   * Override in subclasses for different auth mechanisms (HMAC, Bearer, etc.)
   */
  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  /**
   * Store tokens in HttpOnly cookies
   *
   * Cookie durations are now aligned with the plan:
   * - access_token: 1h (matches backend token lifetime)
   * - refresh_token: 30 days
   * - token_expires_at: readable by client JS for UX indicators
   */
  async storeTokens(tokens: TokenStorage): Promise<void> {
    const cookieStore = await cookies();

    const expiresIn = tokens.expires_in || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE;

    // Store access token (HttpOnly, 1h max-age)
    if (tokens.access_token) {
      cookieStore.set({
        name: COOKIE_NAMES.ACCESS_TOKEN,
        value: tokens.access_token,
        ...BASE_COOKIE_CONFIG,
        httpOnly: true,
        maxAge: expiresIn,
      });

      // Store expiration timestamp (non-HttpOnly for client UX)
      const expiresAt = calculateExpirationTimestamp(expiresIn);
      cookieStore.set({
        name: COOKIE_NAMES.TOKEN_EXPIRES_AT,
        value: formatExpirationForCookie(expiresAt),
        ...BASE_COOKIE_CONFIG,
        httpOnly: false, // Client can read this for UX
        maxAge: expiresIn,
      });
    }

    // Store refresh token if present (HttpOnly, 30 days)
    if (tokens.refresh_token) {
      cookieStore.set({
        name: COOKIE_NAMES.REFRESH_TOKEN,
        value: tokens.refresh_token,
        ...BASE_COOKIE_CONFIG,
        httpOnly: true,
        maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
      });
    }
  }

  /**
   * Clear all auth tokens
   */
  async clearTokens(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAMES.ACCESS_TOKEN);
    cookieStore.delete(COOKIE_NAMES.REFRESH_TOKEN);
    cookieStore.delete(COOKIE_NAMES.TOKEN_EXPIRES_AT);
  }

  /**
   * Get access token from cookie
   */
  async getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN);
    return token?.value ?? null;
  }

  /**
   * Get refresh token from cookie
   */
  protected async getRefreshToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN);
    return token?.value ?? null;
  }

  // Abstract methods to be implemented by each adapter
  abstract login(credentials: LoginRequest): Promise<AuthResponse>;
  abstract register(data: RegisterRequest): Promise<AuthResponse>;
  abstract logout(): Promise<void>;
  abstract refresh(request?: RefreshTokenRequest): Promise<AuthResponse>;
  abstract getUser(): Promise<NormalizedUser | null>;
  abstract getOAuthProviders(): Promise<string[]>;
  abstract getOAuthUrl(provider: string): Promise<string>;
}
