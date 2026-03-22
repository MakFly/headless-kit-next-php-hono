/**
 * Proxy configuration for BFF route handlers
 *
 * Provides backend-specific configuration for the API proxy routes
 */

import { getBackendType } from './index';
import type { BackendType } from './types';

export type ProxyConfig = {
  baseUrl: string;
  timeout: number;
  transformPath: (bffPath: string) => string;
  publicRoutes: string[];
  transformResponse?: (data: unknown) => unknown;
};

function getLaravelConfig(): ProxyConfig {
  const authPrefix = process.env.LARAVEL_AUTH_PREFIX || '/api/v1/auth';

  return {
    baseUrl: process.env.LARAVEL_API_URL || 'http://localhost:8002',
    timeout: 30000,
    transformPath: (bffPath: string) => {
      return bffPath;
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

function getSymfonyConfig(): ProxyConfig {
  const authPrefix = process.env.SYMFONY_AUTH_PREFIX || '/api/v1/auth';

  return {
    baseUrl: process.env.SYMFONY_API_URL || 'http://localhost:8001',
    timeout: 30000,
    transformPath: (bffPath: string) => {
      if (bffPath === '/api/v1/me') {
        return `${authPrefix}/me`;
      }
      if (bffPath.startsWith('/api/v1/auth/')) {
        return bffPath;
      }
      return bffPath;
    },
    publicRoutes: [
      `${authPrefix}/login`,
      `${authPrefix}/register`,
      `${authPrefix}/refresh`,
      `${authPrefix}/oauth/providers`,
    ],
  };
}

function getNodeConfig(): ProxyConfig {
  const authPrefix = process.env.NODE_AUTH_PREFIX || '/api/v1/auth';

  return {
    baseUrl: process.env.NODE_API_URL || 'http://localhost:3333',
    timeout: 30000,
    transformPath: (bffPath: string) => {
      if (bffPath.startsWith('/api/v1/auth/')) {
        return bffPath.replace('/api/v1/auth/', `${authPrefix}/`);
      }
      if (bffPath === '/api/v1/me') {
        return `${authPrefix}/me`;
      }
      return bffPath.replace('/api/v1/', '/api/');
    },
    publicRoutes: [
      `${authPrefix}/login`,
      `${authPrefix}/register`,
      `${authPrefix}/refresh`,
      `${authPrefix}/oauth/providers`,
    ],
  };
}

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

export function isPublicRoute(config: ProxyConfig, backendPath: string): boolean {
  return config.publicRoutes.some((route) => backendPath.startsWith(route));
}

export function buildBackendUrl(config: ProxyConfig, backendPath: string): URL {
  const pathWithoutLeadingSlash = backendPath.replace(/^\//, '');
  return new URL(pathWithoutLeadingSlash, config.baseUrl);
}
