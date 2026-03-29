import { AdapterError, BaseAdapter } from '../base-adapter'
import { apiRequestJson } from '../../http/api-request'
import {
  transformAuthResponse,
  transformMeResponse,
  transformOAuthProviders,
  transformOAuthRedirect,
} from './transformer'
import type {
  AdapterConfig,
  AuthResponse,
  LoginRequest,
  NormalizedUser,
  RecoveryCodesResponse,
  RefreshTokenRequest,
  RegisterRequest,
  TwoFaDisableResponse,
  TwoFaEnableResponse,
  TwoFaSetupResponse,
  TwoFaStatus,
} from '../types'

const ENDPOINTS = {
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH: '/api/v1/auth/refresh',
  ME: '/api/v1/me',
  OAUTH_PROVIDERS: '/api/v1/auth/providers',
  OAUTH_REDIRECT: (provider: string) => `/api/v1/auth/${provider}/redirect`,
  TWO_FA_STATUS: '/api/v1/auth/2fa/status',
  TWO_FA_SETUP: '/api/v1/auth/2fa/setup',
  TWO_FA_ENABLE: '/api/v1/auth/2fa/enable',
  TWO_FA_VERIFY: '/api/v1/auth/2fa/verify',
  TWO_FA_DISABLE: '/api/v1/auth/2fa/disable',
  TWO_FA_RECOVERY: '/api/v1/auth/2fa/recovery',
  TWO_FA_RECOVERY_CODES: '/api/v1/auth/2fa/recovery-codes',
}

export class LaravelAdapter extends BaseAdapter {
  constructor(config: Partial<AdapterConfig> = {}) {
    const fullConfig: AdapterConfig = {
      baseUrl: process.env.LARAVEL_API_URL || 'http://localhost:8002',
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
    } = {}
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

  async getOAuthProviders(): Promise<Array<string>> {
    const response = await this.makeRequest<{ data: Array<string> }>(
      'GET', ENDPOINTS.OAUTH_PROVIDERS, { includeAuth: false }
    )
    return transformOAuthProviders(response)
  }

  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<{ data: { redirect_url: string } }>(
      'GET', ENDPOINTS.OAUTH_REDIRECT(provider), { includeAuth: false }
    )
    return transformOAuthRedirect(response)
  }

  async get2faStatus(): Promise<TwoFaStatus> {
    const response = await this.makeRequest<{ enabled: boolean } | { data: { enabled: boolean } }>(
      'GET', ENDPOINTS.TWO_FA_STATUS
    )
    const data = 'data' in response ? response.data : response
    return { enabled: data.enabled ?? false }
  }

  async setup2fa(): Promise<TwoFaSetupResponse> {
    const response = await this.makeRequest<{
      secret?: string
      qrCode?: string
      qr_code?: string
      backupCodes?: Array<string>
      backup_codes?: Array<string>
      data?: { secret: string; qrCode?: string; qr_code?: string; backupCodes?: Array<string>; backup_codes?: Array<string> }
    }>('POST', ENDPOINTS.TWO_FA_SETUP)
    const d = response.data ?? response
    return {
      secret: d.secret ?? '',
      qrCode: d.qrCode ?? d.qr_code ?? '',
      backupCodes: d.backupCodes ?? d.backup_codes ?? [],
    }
  }

  async enable2fa(code: string): Promise<TwoFaEnableResponse> {
    const response = await this.makeRequest<{
      enabled?: boolean
      backupCodes?: Array<string>
      backup_codes?: Array<string>
      data?: { enabled: boolean; backupCodes?: Array<string>; backup_codes?: Array<string> }
    }>('POST', ENDPOINTS.TWO_FA_ENABLE, { body: { code } })
    const d = response.data ?? response
    return {
      enabled: d.enabled ?? true,
      backupCodes: d.backupCodes ?? d.backup_codes ?? [],
    }
  }

  async verify2fa(code: string): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      data: { user: unknown; access_token: string; token_type?: string; expires_in?: number }
    }>('POST', ENDPOINTS.TWO_FA_VERIFY, { body: { code }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async disable2fa(code: string): Promise<TwoFaDisableResponse> {
    const response = await this.makeRequest<{ enabled?: boolean; data?: { enabled: boolean } }>(
      'POST', ENDPOINTS.TWO_FA_DISABLE, { body: { code } }
    )
    const d = response.data ?? response
    return { enabled: d.enabled ?? false }
  }

  async verify2faRecovery(code: string): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      data: { user: unknown; access_token: string; token_type?: string; expires_in?: number }
    }>('POST', ENDPOINTS.TWO_FA_RECOVERY, { body: { code }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async getRecoveryCodes(): Promise<RecoveryCodesResponse> {
    const response = await this.makeRequest<{
      codes?: Array<string>
      backupCodes?: Array<string>
      backup_codes?: Array<string>
      data?: { codes?: Array<string>; backupCodes?: Array<string>; backup_codes?: Array<string> }
    }>('GET', ENDPOINTS.TWO_FA_RECOVERY_CODES)
    const d = response.data ?? response
    return { codes: d.codes ?? d.backupCodes ?? d.backup_codes ?? [] }
  }

  async updateProfile(data: { name?: string; email?: string }): Promise<NormalizedUser> {
    const response = await this.makeRequest<{ data: NormalizedUser } | NormalizedUser>(
      'PATCH', '/api/v1/auth/me', { body: data }
    )
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as { data: NormalizedUser }).data
    }
    return response
  }

  async deleteAccount(): Promise<void> {
    await this.makeRequest('DELETE', '/api/v1/auth/me')
    await this.clearTokens()
  }
}
