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

function getAuthPath(prefix: string, path: string): string {
  const base = prefix?.replace(/\/$/, '') || '/auth'
  return `${base}${path.startsWith('/') ? path : '/' + path}`
}

export type SymfonyAdapterConfig = AdapterConfig

export class SymfonyAdapter extends BaseAdapter {
  private readonly authPrefix: string

  constructor(config: Partial<SymfonyAdapterConfig> = {}) {
    const fullConfig: SymfonyAdapterConfig = {
      baseUrl: process.env.SYMFONY_API_URL || 'http://localhost:8001',
      timeout: 30000,
      ...config,
    }
    super(fullConfig)
    this.authPrefix = config.authPrefix ?? process.env.SYMFONY_AUTH_PREFIX ?? '/auth'
  }

  private get path() {
    return {
      LOGIN: getAuthPath(this.authPrefix, '/login'),
      REGISTER: getAuthPath(this.authPrefix, '/register'),
      LOGOUT: getAuthPath(this.authPrefix, '/logout'),
      REFRESH: getAuthPath(this.authPrefix, '/refresh'),
      ME: getAuthPath(this.authPrefix, '/me'),
      OAUTH_PROVIDERS: getAuthPath(this.authPrefix, '/oauth/providers'),
      OAUTH_REDIRECT: (provider: string) => getAuthPath(this.authPrefix, `/oauth/${provider}/redirect`),
      TWO_FA_STATUS: getAuthPath(this.authPrefix, '/2fa/status'),
      TWO_FA_SETUP: getAuthPath(this.authPrefix, '/2fa/setup'),
      TWO_FA_ENABLE: getAuthPath(this.authPrefix, '/2fa/enable'),
      TWO_FA_VERIFY: getAuthPath(this.authPrefix, '/2fa/verify'),
      TWO_FA_DISABLE: getAuthPath(this.authPrefix, '/2fa/disable'),
      TWO_FA_RECOVERY: getAuthPath(this.authPrefix, '/2fa/recovery'),
      TWO_FA_RECOVERY_CODES: getAuthPath(this.authPrefix, '/2fa/recovery-codes'),
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; access_token: string; refresh_token?: string; expires_in?: number; token_type?: string
    }>('POST', this.path.LOGIN, { body: credentials, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const registrationData: Record<string, string> = {
      name: data.name, email: data.email, password: data.password,
    }
    const response = await this.makeRequest<{
      user: unknown; access_token: string; refresh_token?: string; expires_in?: number; token_type?: string
    }>('POST', this.path.REGISTER, { body: registrationData, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async logout(): Promise<void> {
    try {
      await this.makeRequest('POST', this.path.LOGOUT)
    } finally {
      await this.clearTokens()
    }
  }

  async refresh(request?: RefreshTokenRequest): Promise<AuthResponse> {
    const refreshToken = request?.refresh_token || (await this.getRefreshToken())
    if (!refreshToken) throw new AdapterError('No refresh token available', 401, 'NO_REFRESH_TOKEN')
    const response = await this.makeRequest<{
      user: unknown; access_token: string; refresh_token?: string; expires_in?: number; token_type?: string
    }>('POST', this.path.REFRESH, { body: { refresh_token: refreshToken }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async getUser(): Promise<NormalizedUser | null> {
    try {
      const response = await this.makeRequest<{ user: unknown; expiresAt?: string }>('GET', this.path.ME)
      if (response.expiresAt) {
        this.storeTokenExpiration(response.expiresAt)
      }
      return transformMeResponse(response as never)
    } catch (error) {
      if (error instanceof AdapterError && (error.statusCode === 401 || error.statusCode === 403)) return null
      throw error
    }
  }

  async getOAuthProviders(): Promise<Array<string>> {
    try {
      const response = await this.makeRequest<{ providers: Array<string> } | Array<string>>(
        'GET', this.path.OAUTH_PROVIDERS, { includeAuth: false }
      )
      return transformOAuthProviders(response)
    } catch { return [] }
  }

  async getOAuthUrl(provider: string): Promise<string> {
    const response = await this.makeRequest<{ url: string } | { redirect_url: string }>(
      'GET', this.path.OAUTH_REDIRECT(provider), { includeAuth: false }
    )
    return transformOAuthRedirect(response)
  }

  async get2faStatus(): Promise<TwoFaStatus> {
    const response = await this.makeRequest<{ enabled: boolean }>('GET', this.path.TWO_FA_STATUS)
    return { enabled: response.enabled ?? false }
  }

  async setup2fa(): Promise<TwoFaSetupResponse> {
    const response = await this.makeRequest<{
      secret: string
      qrCode?: string
      qr_code?: string
      backupCodes?: Array<string>
      backup_codes?: Array<string>
    }>('POST', this.path.TWO_FA_SETUP)
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
    }>('POST', this.path.TWO_FA_ENABLE, { body: { code } })
    return {
      enabled: response.enabled ?? true,
      backupCodes: response.backupCodes ?? response.backup_codes ?? [],
    }
  }

  async verify2fa(code: string): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; access_token: string; refresh_token?: string; expires_in?: number; token_type?: string
    }>('POST', this.path.TWO_FA_VERIFY, { body: { code }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async disable2fa(code: string): Promise<TwoFaDisableResponse> {
    const response = await this.makeRequest<{ enabled: boolean }>(
      'POST', this.path.TWO_FA_DISABLE, { body: { code } }
    )
    return { enabled: response.enabled ?? false }
  }

  async verify2faRecovery(code: string): Promise<AuthResponse> {
    const response = await this.makeRequest<{
      user: unknown; access_token: string; refresh_token?: string; expires_in?: number; token_type?: string
    }>('POST', this.path.TWO_FA_RECOVERY, { body: { code }, includeAuth: false })
    const authResponse = transformAuthResponse(response as never)
    await this.storeTokens(authResponse.tokens)
    return authResponse
  }

  async getRecoveryCodes(): Promise<RecoveryCodesResponse> {
    const response = await this.makeRequest<{
      codes?: Array<string>
      backupCodes?: Array<string>
      backup_codes?: Array<string>
    }>('GET', this.path.TWO_FA_RECOVERY_CODES)
    return { codes: response.codes ?? response.backupCodes ?? response.backup_codes ?? [] }
  }

  async updateProfile(data: { name?: string; email?: string }): Promise<NormalizedUser> {
    const response = await this.makeRequest<unknown>(
      'PATCH', this.path.ME, { body: data }
    )
    return response as NormalizedUser
  }

  async deleteAccount(): Promise<void> {
    await this.makeRequest('DELETE', this.path.ME)
    await this.clearTokens()
  }
}
