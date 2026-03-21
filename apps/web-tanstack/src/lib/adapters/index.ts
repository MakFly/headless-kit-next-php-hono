import { LaravelAdapter } from './laravel/adapter'
import { SymfonyAdapter } from './symfony/adapter'
import { NodeAdapter } from './node/adapter'
import type { AdapterConfig, AuthAdapter, BackendType } from './types'

export type { AuthAdapter, BackendType, AdapterConfig } from './types'
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
  TokenStorage,
} from './types'
export { toUser } from './types'
export { LaravelAdapter } from './laravel/adapter'
export { SymfonyAdapter } from './symfony/adapter'
export { NodeAdapter } from './node/adapter'
export { AdapterError } from './errors'
export { COOKIE_NAMES } from './base-adapter'

export function getBackendType(): BackendType {
  const backend = process.env.AUTH_BACKEND || 'laravel'
  if (backend !== 'laravel' && backend !== 'symfony' && backend !== 'node') {
    console.warn(`Unknown AUTH_BACKEND "${backend}", defaulting to "laravel"`)
    return 'laravel'
  }
  return backend
}

export function getAdapterConfig(backend: BackendType): Partial<AdapterConfig> {
  switch (backend) {
    case 'laravel':
      return {
        baseUrl: process.env.LARAVEL_API_URL || 'http://localhost:8002',
      }
    case 'symfony':
      return {
        baseUrl: process.env.SYMFONY_API_URL || 'http://localhost:8001',
        authPrefix: process.env.SYMFONY_AUTH_PREFIX || '/api/v1/auth',
      }
    case 'node':
      return {
        baseUrl: process.env.NODE_API_URL || 'http://localhost:3333',
        authPrefix: process.env.NODE_AUTH_PREFIX || '/api/auth',
      }
  }
}

let adapterInstance: AuthAdapter | null = null
let lastBackendType: BackendType | null = null

export function getAuthAdapter(): AuthAdapter {
  const backendType = getBackendType()
  if (adapterInstance && lastBackendType === backendType) return adapterInstance
  const config = getAdapterConfig(backendType)
  switch (backendType) {
    case 'laravel': adapterInstance = new LaravelAdapter(config); break
    case 'symfony': adapterInstance = new SymfonyAdapter(config); break
    case 'node': adapterInstance = new NodeAdapter(config); break
  }
  lastBackendType = backendType
  return adapterInstance
}

export function resetAdapter(): void {
  adapterInstance = null
  lastBackendType = null
}
