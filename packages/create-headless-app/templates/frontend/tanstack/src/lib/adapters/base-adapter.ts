import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import {
  TOKEN_CONFIG,
  COOKIE_NAMES as TOKEN_COOKIE_NAMES,
  calculateExpirationTimestamp,
  formatExpirationForCookie,
} from '../services/token-service'
import { apiRequestJson } from '../http/api-request'
import { AdapterError } from './errors'
import type {
  AdapterConfig,
  AuthAdapter,
  AuthResponse,
  LoginRequest,
  NormalizedUser,
  RecoveryCodesResponse,
  RefreshTokenRequest,
  RegisterRequest,
  TokenStorage,
  TwoFaDisableResponse,
  TwoFaEnableResponse,
  TwoFaSetupResponse,
  TwoFaStatus,
} from './types'

export { AdapterError } from './errors'

const BASE_COOKIE_CONFIG = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export const COOKIE_NAMES = TOKEN_COOKIE_NAMES

const DEFAULT_TIMEOUT = 30000

export abstract class BaseAdapter implements AuthAdapter {
  protected config: AdapterConfig

  constructor(config: AdapterConfig) {
    this.config = { timeout: DEFAULT_TIMEOUT, ...config }
  }

  protected async makeRequest<T>(
    method: string,
    path: string,
    options: {
      body?: unknown
      headers?: Record<string, string>
      includeAuth?: boolean
    } = {},
  ): Promise<T> {
    const { body, headers = {}, includeAuth = true } = options
    const url = `${this.config.baseUrl}${path}`
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    }

    if (includeAuth) {
      const authHeaders = await this.getAuthHeaders()
      Object.assign(requestHeaders, authHeaders)
    }

    try {
      return await apiRequestJson<T>(url, {
        method,
        headers: requestHeaders,
        body: body == null ? undefined : JSON.stringify(body),
        timeoutMs: this.config.timeout,
      })
    } catch (error) {
      if (error instanceof AdapterError) throw error
      throw AdapterError.fromUnknown(error)
    }
  }

  protected async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await this.getAccessToken()
    if (token) return { Authorization: `Bearer ${token}` }
    return {}
  }

  async storeTokens(tokens: TokenStorage): Promise<void> {
    const expiresIn = tokens.expires_in || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE

    if (tokens.access_token) {
      setCookie(COOKIE_NAMES.ACCESS_TOKEN, tokens.access_token, {
        ...BASE_COOKIE_CONFIG,
        httpOnly: true,
        maxAge: expiresIn,
      })

      const expiresAt = calculateExpirationTimestamp(expiresIn)
      setCookie(
        COOKIE_NAMES.TOKEN_EXPIRES_AT,
        formatExpirationForCookie(expiresAt),
        {
          ...BASE_COOKIE_CONFIG,
          httpOnly: false,
          maxAge: expiresIn,
        },
      )
    }

    if (tokens.refresh_token) {
      setCookie(COOKIE_NAMES.REFRESH_TOKEN, tokens.refresh_token, {
        ...BASE_COOKIE_CONFIG,
        httpOnly: true,
        maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
      })
    }
  }

  protected storeTokenExpiration(expiresAt: number | string): void {
    const iso =
      typeof expiresAt === 'number'
        ? formatExpirationForCookie(expiresAt)
        : expiresAt
    const maxAge =
      typeof expiresAt === 'number'
        ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
        : TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
    setCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT, iso, {
      ...BASE_COOKIE_CONFIG,
      httpOnly: false,
      maxAge,
    })
  }

  async clearTokens(): Promise<void> {
    deleteCookie(COOKIE_NAMES.ACCESS_TOKEN)
    deleteCookie(COOKIE_NAMES.REFRESH_TOKEN)
    deleteCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT)
  }

  async getAccessToken(): Promise<string | null> {
    return getCookie(COOKIE_NAMES.ACCESS_TOKEN) ?? null
  }

  protected async getRefreshToken(): Promise<string | null> {
    return getCookie(COOKIE_NAMES.REFRESH_TOKEN) ?? null
  }

  abstract login(credentials: LoginRequest): Promise<AuthResponse>
  abstract register(data: RegisterRequest): Promise<AuthResponse>
  abstract logout(): Promise<void>
  abstract refresh(request?: RefreshTokenRequest): Promise<AuthResponse>
  abstract getUser(): Promise<NormalizedUser | null>
  abstract getOAuthProviders(): Promise<Array<string>>
  abstract getOAuthUrl(provider: string): Promise<string>
  abstract get2faStatus(): Promise<TwoFaStatus>
  abstract setup2fa(): Promise<TwoFaSetupResponse>
  abstract enable2fa(code: string): Promise<TwoFaEnableResponse>
  abstract verify2fa(code: string): Promise<AuthResponse>
  abstract disable2fa(code: string): Promise<TwoFaDisableResponse>
  abstract verify2faRecovery(code: string): Promise<AuthResponse>
  abstract getRecoveryCodes(): Promise<RecoveryCodesResponse>
  abstract updateProfile(data: { name?: string; email?: string }): Promise<NormalizedUser>
  abstract deleteAccount(): Promise<void>
}
