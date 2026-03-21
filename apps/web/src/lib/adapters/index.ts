/**
 * Auth adapters factory and exports
 *
 * This module provides a unified interface for authentication across
 * Laravel, Symfony, and Node.js backends.
 *
 * Usage:
 *   import { getAuthAdapter } from '@/lib/adapters';
 *   const adapter = getAuthAdapter();
 *   const user = await adapter.getUser();
 */

import type { AuthAdapter, BackendType, AdapterConfig } from './types';
import { LaravelAdapter } from './laravel';
import { SymfonyAdapter } from './symfony';
import { NodeAdapter } from './node';
import { getDefaultBackend, normalizeBackend } from '@/lib/auth/backend-context';

// Re-export types
export type { AuthAdapter, BackendType, AdapterConfig } from './types';
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
  TokenStorage,
} from './types';
export { toUser } from './types';

// Re-export adapters
export { LaravelAdapter } from './laravel';
export { SymfonyAdapter } from './symfony';
export { NodeAdapter } from './node';

// Re-export base adapter utilities
export { AdapterError } from './errors';
export { COOKIE_NAMES } from './base-adapter';

// Re-export proxy configuration
export {
  getProxyConfig,
  isPublicRoute,
  buildBackendUrl,
  type ProxyConfig,
} from './proxy-config';

/**
 * Get the configured backend type from environment
 */
export function getBackendType(): BackendType {
  const backend = normalizeBackend(process.env.AUTH_BACKEND);

  if (!backend) {
    console.warn(`Unknown AUTH_BACKEND "${backend}", defaulting to "laravel"`);
    return 'laravel';
  }

  return backend;
}

/**
 * Get adapter configuration from environment
 */
export function getAdapterConfig(backend: BackendType): Partial<AdapterConfig> {
  switch (backend) {
    case 'laravel':
      return {
        baseUrl: process.env.LARAVEL_API_URL || 'http://localhost:8002',
      };

    case 'symfony':
      return {
        baseUrl: process.env.SYMFONY_API_URL || 'http://localhost:8001',
      };

    case 'node':
      return {
        baseUrl: process.env.NODE_API_URL || 'http://localhost:3333',
        authPrefix: process.env.NODE_AUTH_PREFIX || '/api/auth',
      };
  }
}

/**
 * Singleton adapter instance
 */
const adapterInstances: Partial<Record<BackendType, AuthAdapter>> = {};

/**
 * Get the auth adapter for the configured backend
 *
 * Returns a singleton instance based on AUTH_BACKEND environment variable.
 * The adapter is cached and reused across calls.
 *
 * @returns AuthAdapter instance for the configured backend
 *
 * @example
 * ```typescript
 * const adapter = getAuthAdapter();
 * const user = await adapter.getUser();
 * ```
 */
export function getAuthAdapter(backendOverride?: BackendType): AuthAdapter {
  const backendType = backendOverride ?? getDefaultBackend();

  const cachedAdapter = adapterInstances[backendType];
  if (cachedAdapter) {
    return cachedAdapter;
  }

  const config = getAdapterConfig(backendType);

  switch (backendType) {
    case 'laravel':
      adapterInstances[backendType] = new LaravelAdapter(config);
      break;

    case 'symfony':
      adapterInstances[backendType] = new SymfonyAdapter(config);
      break;

    case 'node':
      adapterInstances[backendType] = new NodeAdapter(config);
      break;
  }

  return adapterInstances[backendType] as AuthAdapter;
}

/**
 * Create a specific adapter instance (for testing or custom use)
 *
 * @param backend - Backend type to create adapter for
 * @param config - Optional custom configuration
 * @returns AuthAdapter instance
 */
export function createAdapter(
  backend: BackendType,
  config?: Partial<AdapterConfig>
): AuthAdapter {
  const defaultConfig = getAdapterConfig(backend);
  const mergedConfig = { ...defaultConfig, ...config };

  switch (backend) {
    case 'laravel':
      return new LaravelAdapter(mergedConfig);

    case 'symfony':
      return new SymfonyAdapter(mergedConfig);

    case 'node':
      return new NodeAdapter(mergedConfig);
  }
}

/**
 * Reset the adapter singleton (for testing)
 */
export function resetAdapter(): void {
  delete adapterInstances.laravel;
  delete adapterInstances.symfony;
  delete adapterInstances.node;
}
