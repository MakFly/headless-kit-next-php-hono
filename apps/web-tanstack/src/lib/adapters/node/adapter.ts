import { AdapterError, BaseAdapter } from '../base-adapter'
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

function buildEndpoints(prefix: string) {
  return {
    LOGIN: `${prefix}/login`,
    REGISTER: `${prefix}/register`,
    LOGOUT: `${prefix}/logout`,
    REFRESH: `${prefix}/refresh`,
    ME: `${prefix}/me`,
    OAUTH_PROVIDERS: `${prefix}/oauth/providers`,
    OAUTH_REDIRECT: (provider: string) => `${prefix}/oauth/${provider}/redirect`,
    TWO_FA_STATUS: `${prefix}/2fa/status`,
    TWO_FA_SETUP: `${prefix}/2fa/setup`,
    TWO_FA_ENABLE: `${prefix}/2fa/enable`,
    TWO_FA_VERIFY: `${prefix}/2fa/verify`,
    TWO_FA_DISABLE: `${prefix}/2fa/disable`,
    TWO_FA_RECOVERY: `${prefix}/2fa/recovery`,
    TWO_FA_RECOVERY_CODES: `${prefix}/2fa/recovery-codes`,
  }
}

export type NodeAdapterConfig = AdapterConfig & { authPrefix?: string }

export class NodeAdapter extends BaseAdapter {
  protected override config: NodeAdapterConfig
  private endpoints: ReturnType<typeof buildEndpoints>

  constructor(config: Partial<NodeAdapterConfig> = {}) {
    const fullConfig: NodeAdapterConfig = {
      baseUrl: process.env.NODE_API_URL || 'http://localhost:3333',
      timeout: 30000,
      authPrefix: config.authPrefix || process.env.NODE_AUTH_PREFIX || '/api/auth',
      ...config,
    }
    super(fullConfig)
    this.config = fullConfig
    this.endpoints = buildEndpoints(this.config.authPrefix!)
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; accessToken?: string; access_token?: string; refreshToken?: string; refresh_token?: string; expiresIn?: number; expires_in?: number; tokenType?: string; token_type?: string
    }>('POST', this.endpoints.LOGIN, { body: credentials, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; accessToken?: string; access_token?: string; refreshToken?: string; refresh_token?: string; expiresIn?: number; expires_in?: number; tokenType?: string; token_type?: string
    }>('POST', this.endpoints.REGISTER, { body: data, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('POST', this.endpoints.LOGOUT)
    } finally {
      await this.clearTokens()
    }
  }

  async refresh(request?: RefreshTokenRequest): Promise<AuthResponse> {
    const refreshToken = request?.refresh_token || (await this.getRefreshToken())
    if (!refreshToken) throw new AdapterError('No refresh token available', 401, 'NO_REFRESH_TOKEN')
    const response = await this.makeRequest<{
      user: unknown; accessToken?: string; access_token?: string; refreshToken?: string; refresh_token?: string; expiresIn?: number; expires_in?: number; tokenType?: string; token_type?: string
    }>('POST', this.endpoints.REFRESH, {
      body: { refreshToken, refresh_token: refreshToken }, includeAuth: false,
    })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async getUser(): Promise<NormalizedUser | null> {
    try {
      const response = await this.makeRequest<unknown>('GET', this.endpoints.ME)
      return transformMeResponse(response as never)
    } catch (error) {
      if (error instanceof AdapterError && (error.statusCode === 401 || error.statusCode === 403)) return null
      throw error
    }
  }

  async getOAuthProviders(): Promise<Array<string>> {
    try {
      const response = await this.makeRequest<{ providers: Array<string> } | Array<string> | { data: Array<string> }>(
        'GET', this.endpoints.OAUTH_PROVIDERS, { includeAuth: false }
      )
      return transformOAuthProviders(response)
    } catch { return [] }
  }

  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<{ url: string } | { redirectUrl: string } | { redirect_url: string }>(
      'GET', this.endpoints.OAUTH_REDIRECT(provider), { includeAuth: false }
    )
    return transformOAuthRedirect(response)
  }

  async get2faStatus(): Promise<TwoFaStatus> {
    const response = await this.makeRequest<{ enabled: boolean }>('GET', this.endpoints.TWO_FA_STATUS)
    return { enabled: response.enabled ?? false }
  }

  async setup2fa(): Promise<TwoFaSetupResponse> {
    const response = await this.makeRequest<{
      secret: string
      qrCode?: string
      qr_code?: string
      backupCodes?: Array<string>
      backup_codes?: Array<string>
    }>('POST', this.endpoints.TWO_FA_SETUP)
    return {
      secret: response.secret,
      qrCode: response.qrCode ?? response.qr_code ?? '',
      backupCodes: response.backupCodes ?? response.backup_codes ?? [],
    }
  }

  async enable2fa(code: string): Promise<TwoFaEnableResponse> {
    const response = await this.makeRequest<{
      enabled: boolean
      backupCodes?: Array<string>
      backup_codes?: Array<string>
    }>('POST', this.endpoints.TWO_FA_ENABLE, { body: { code } })
    return {
      enabled: response.enabled ?? true,
      backupCodes: response.backupCodes ?? response.backup_codes ?? [],
    }
  }

  async verify2fa(code: string): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; accessToken?: string; access_token?: string; refreshToken?: string; refresh_token?: string; expiresIn?: number; expires_in?: number; tokenType?: string; token_type?: string
    }>('POST', this.endpoints.TWO_FA_VERIFY, { body: { code }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async disable2fa(code: string): Promise<TwoFaDisableResponse> {
    const response = await this.makeRequest<{ enabled: boolean }>(
      'POST', this.endpoints.TWO_FA_DISABLE, { body: { code } }
    )
    return { enabled: response.enabled ?? false }
  }

  async verify2faRecovery(code: string): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; accessToken?: string; access_token?: string; refreshToken?: string; refresh_token?: string; expiresIn?: number; expires_in?: number; tokenType?: string; token_type?: string
    }>('POST', this.endpoints.TWO_FA_RECOVERY, { body: { code }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async getRecoveryCodes(): Promise<RecoveryCodesResponse> {
    const response = await this.makeRequest<{
      codes?: string[]
      backupCodes?: string[]
      backup_codes?: string[]
    }>('GET', this.endpoints.TWO_FA_RECOVERY_CODES)
    return { codes: response.codes ?? response.backupCodes ?? response.backup_codes ?? [] }
  }

  async updateProfile(data: { name?: string; email?: string }): Promise<NormalizedUser> {
    const response = await this.makeRequest<NormalizedUser>(
      'PATCH', this.endpoints.ME, { body: data }
    )
    return response
  }

  async deleteAccount(): Promise<void> {
    await this.makeRequest('DELETE', this.endpoints.ME)
    await this.clearTokens()
  }
}
