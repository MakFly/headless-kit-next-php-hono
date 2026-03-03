/**
 * Proxy configuration for BFF route handlers
 *
 * Provides backend-specific configuration for the API proxy routes
 * All backends support configurable API versioning via environment variables
 */

import { getBackendType } from './index';
import type { BackendType } from './types';
import { generateSignature } from '../security/hmac';

/**
 * Backend proxy configuration
 */
export type ProxyConfig = {
  baseUrl: string;
  timeout: number;
  /**
   * Transform the BFF path to the backend path
   */
  transformPath: (bffPath: string) => string;
  /**
   * Get additional headers for the request (HMAC, etc.)
   */
  getSignatureHeaders: (
    method: string,
    path: string,
    body?: unknown
  ) => { headers: Record<string, string>; normalizedBody?: string };
  /**
   * Public routes that don't require authentication
   */
  publicRoutes: string[];
  /**
   * Transform the response data if needed
   */
  transformResponse?: (data: unknown) => unknown;
};

/**
 * Laravel proxy configuration
 * Routes: /api/v1/auth/* (configurable via LARAVEL_AUTH_PREFIX)
 */
function getLaravelConfig(): ProxyConfig {
  const authPrefix = process.env.LARAVEL_AUTH_PREFIX || '/api/v1/auth';

  return {
    baseUrl: process.env.LARAVEL_API_URL || 'http://localhost:8000',
    timeout: 30000,
    transformPath: (bffPath: string) => {
      // /api/v1/* in BFF maps to /api/v1/* in Laravel (1:1 mapping)
      return bffPath;
    },
    getSignatureHeaders: (method: string, path: string, body?: unknown) => {
      const hmacResult = generateSignature(method, path, body);
      const headers: Record<string, string> = {
        'X-BFF-Id': hmacResult['X-BFF-Id'],
        'X-BFF-Timestamp': hmacResult['X-BFF-Timestamp'],
        'X-BFF-Signature': hmacResult['X-BFF-Signature'],
      };
      return {
        headers,
        normalizedBody: hmacResult.normalizedBody,
      };
    },
    publicRoutes: [
      `${authPrefix}/login`,
      `${authPrefix}/register`,
      `${authPrefix}/refresh`,
      `${authPrefix}/providers`,
      `${authPrefix}/oauth/providers`,
    ],
  };
}

/**
 * Symfony proxy configuration
 * Routes: /api/v1/auth/* (configurable via SYMFONY_AUTH_PREFIX)
 */
function getSymfonyConfig(): ProxyConfig {
  // Symfony BetterAuth routes are now versioned at /api/v1/auth/*
  const authPrefix = process.env.SYMFONY_AUTH_PREFIX || '/api/v1/auth';

  return {
    baseUrl: process.env.SYMFONY_API_URL || 'http://localhost:8002',
    timeout: 30000,
    transformPath: (bffPath: string) => {
      // /api/v1/auth/* in BFF maps to /api/v1/auth/* in Symfony (1:1 mapping)
      // /api/v1/me in BFF maps to /api/v1/auth/me in Symfony
      if (bffPath === '/api/v1/me') {
        return `${authPrefix}/me`;
      }
      // Auth routes pass through directly
      if (bffPath.startsWith('/api/v1/auth/')) {
        return bffPath;
      }
      // Other routes pass through
      return bffPath;
    },
    getSignatureHeaders: () => {
      // Symfony uses Bearer token only, no HMAC
      return { headers: {} };
    },
    publicRoutes: [
      `${authPrefix}/login`,
      `${authPrefix}/register`,
      `${authPrefix}/refresh`,
      `${authPrefix}/oauth/providers`,
    ],
  };
}

/**
 * Node.js (Hono) proxy configuration
 * Routes: /api/v1/auth/* (configurable via NODE_AUTH_PREFIX)
 */
function getNodeConfig(): ProxyConfig {
  // Node.js API routes are versioned at /api/v1/auth/* by default
  const authPrefix = process.env.NODE_AUTH_PREFIX || '/api/v1/auth';

  return {
    baseUrl: process.env.NODE_API_URL || 'http://localhost:8003',
    timeout: 30000,
    transformPath: (bffPath: string) => {
      // /api/v1/auth/* in BFF maps to NODE_AUTH_PREFIX/* in Node.js
      // /api/v1/me in BFF maps to NODE_AUTH_PREFIX/me in Node.js
      if (bffPath.startsWith('/api/v1/auth/')) {
        return bffPath.replace('/api/v1/auth/', `${authPrefix}/`);
      }
      if (bffPath === '/api/v1/me') {
        return `${authPrefix}/me`;
      }
      // Other routes pass through
      return bffPath.replace('/api/v1/', '/api/');
    },
    getSignatureHeaders: () => {
      // Node.js uses Bearer token only, no HMAC
      return { headers: {} };
    },
    publicRoutes: [
      `${authPrefix}/login`,
      `${authPrefix}/register`,
      `${authPrefix}/refresh`,
      `${authPrefix}/oauth/providers`,
    ],
  };
}

/**
 * Get proxy configuration for the current backend
 */
export function getProxyConfig(backendOverride?: BackendType): ProxyConfig {
  const backend = backendOverride ?? getBackendType();

  switch (backend) {
    case 'laravel':
      return getLaravelConfig();
    case 'symfony':
      return getSymfonyConfig();
    case 'node':
      return getNodeConfig();
  }
}

/**
 * Check if a path is a public route (no auth required)
 */
export function isPublicRoute(config: ProxyConfig, backendPath: string): boolean {
  return config.publicRoutes.some((route) => backendPath.startsWith(route));
}

/**
 * Build the full backend URL
 */
export function buildBackendUrl(config: ProxyConfig, backendPath: string): URL {
  // Remove leading slash for URL construction
  const pathWithoutLeadingSlash = backendPath.replace(/^\//, '');
  return new URL(pathWithoutLeadingSlash, config.baseUrl);
}
