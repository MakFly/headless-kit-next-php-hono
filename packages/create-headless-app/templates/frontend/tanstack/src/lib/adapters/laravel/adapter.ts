import type {
  AdapterConfig,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
} from '../types'
import { BaseAdapter, AdapterError } from '../base-adapter'
import { apiRequestJson } from '../../http/api-request'
import {
  transformAuthResponse,
  transformMeResponse,
  transformOAuthProviders,
  transformOAuthRedirect,
} from './transformer'

const ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/me',
  OAUTH_PROVIDERS: '/api/v1/auth/providers',
  OAUTH_REDIRECT: (provider: string) => `/api/v1/auth/${provider}/redirect`,
}

export class LaravelAdapter extends BaseAdapter {
  constructor(config: Partial<AdapterConfig> = {}) {
    const fullConfig: AdapterConfig = {
      baseUrl: process.env.LARAVEL_API_URL || 'http://localhost:8000',
      timeout: 30000,
      ...config,
    }
    super(fullConfig)
  }

  protected override async makeRequest<T>(
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
      const token = await this.getAccessToken()
      if (token) requestHeaders['Authorization'] = `Bearer ${token}`
    }

    try {
      return await apiRequestJson<T>(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        timeoutMs: this.config.timeout,
      })
    } catch (error) {
      if (error instanceof AdapterError) throw error
      throw AdapterError.fromUnknown(error)
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      data: { user: unknown; access_token: string; token_type?: string; expires_in?: number }
    }>('POST', ENDPOINTS.LOGIN, { body: credentials, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      data: { user: unknown; access_token: string; token_type?: string; expires_in?: number }
    }>('POST', ENDPOINTS.REGISTER, { body: data, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('POST', ENDPOINTS.LOGOUT)
    } finally {
      await this.clearTokens()
    }
  }

  async refresh(request?: RefreshTokenRequest): Promise<AuthResponse> {
    const refreshToken = request?.refresh_token || (await this.getRefreshToken())
    const response = await this.makeRequest<{
      data: { user: unknown; access_token: string; token_type?: string; expires_in?: number }
    }>('POST', ENDPOINTS.REFRESH, {
      body: refreshToken ? { refresh_token: refreshToken } : undefined,
    })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async getUser(): Promise<NormalizedUser | null> {
    try {
      const response = await this.makeRequest<{ data: unknown }>('GET', ENDPOINTS.ME)
      return transformMeResponse(response as never)
    } catch (error) {
      if (error instanceof AdapterError && (error.statusCode === 401 || error.statusCode === 403)) {
        return null
      }
      throw error
    }
  }

  async getOAuthProviders(): Promise<string[]> {
    const response = await this.makeRequest<{ data: string[] }>(
      'GET', ENDPOINTS.OAUTH_PROVIDERS, { includeAuth: false },
    )
    return transformOAuthProviders(response)
  }

  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<{ data: { redirect_url: string } }>(
      'GET', ENDPOINTS.OAUTH_REDIRECT(provider), { includeAuth: false },
    )
    return transformOAuthRedirect(response)
  }
}
