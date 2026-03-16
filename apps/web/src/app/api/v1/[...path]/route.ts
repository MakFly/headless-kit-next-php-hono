/**
 * BFF Route Handler
 *
 * This catch-all handler proxies all /api/v1/* requests to the configured backend
 * (Laravel, Symfony, or Node.js) based on AUTH_BACKEND environment variable.
 *
 * Features:
 * - 401 Interceptor: Automatic token refresh on 401 responses
 * - Proactive Refresh: Refresh tokens before they expire
 */

import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getProxyConfig,
  isPublicRoute,
  buildBackendUrl,
  type ProxyConfig,
} from '@/lib/adapters/proxy-config';
import type { BackendType } from '@/lib/adapters/types';
import { createLogger } from '@/lib/logger';
import { ApiException, apiRequest, readResponseBody } from '@/lib/http';
import {
  TOKEN_CONFIG,
  calculateExpirationTimestamp,
  formatExpirationForCookie,
} from '@/lib/services/token-service';
import { REFRESH_NEEDED_HEADER } from '@/proxy';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';

const log = createLogger('bff-proxy');

/**
 * Type for Next.js 14+ dynamic route params
 */
type RouteParams = {
  params: Promise<{ path: string[] }>;
};

/**
 * Regex to validate path segments (alphanumerics, dashes, underscores only)
 */
const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;
const REQUEST_ID_HEADER = 'x-request-id';
const INTERNAL_REQUEST_HEADER = 'x-bff-internal';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Cookie configuration
 */
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function setNoStoreHeaders(headers: Headers): void {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  headers.set('Pragma', 'no-cache');
}

function getRequestId(request: NextRequest): string {
  return request.headers.get(REQUEST_ID_HEADER) || crypto.randomUUID();
}

function getOriginFromReferer(referer: string | null): string | null {
  if (!referer) {
    return null;
  }
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function validateCsrf(request: NextRequest, method: string): void {
  if (!MUTATING_METHODS.has(method)) {
    return;
  }

  if (request.headers.get(INTERNAL_REQUEST_HEADER) === '1') {
    return;
  }

  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get('origin');
  const refererOrigin = getOriginFromReferer(request.headers.get('referer'));

  if (origin && origin === expectedOrigin) {
    return;
  }

  if (!origin && refererOrigin && refererOrigin === expectedOrigin) {
    return;
  }

  throw new ApiException('CSRF validation failed', {
    statusCode: 403,
    code: origin || refererOrigin ? 'CSRF_ORIGIN_MISMATCH' : 'CSRF_MISSING_ORIGIN',
  });
}

/**
 * Validates path segments to prevent SSRF/Path Traversal attacks
 * @throws {ApiException} if path contains dangerous segments
 */
function validatePathSegments(segments: string[]): void {
  for (const segment of segments) {
    // Reject empty segments
    if (!segment) {
      throw new ApiException('Invalid path: empty segment', {
        statusCode: 400,
        code: 'INVALID_PATH',
      });
    }

    // Reject path traversal
    if (segment === '..' || segment === '.') {
      throw new ApiException('Invalid path: traversal not allowed', {
        statusCode: 400,
        code: 'INVALID_PATH',
      });
    }

    // Reject absolute URLs
    if (segment.includes('://') || segment.startsWith('//')) {
      throw new ApiException('Invalid path: absolute URLs not allowed', {
        statusCode: 400,
        code: 'INVALID_PATH',
      });
    }

    // Validate segment format (alphanumerics, dashes, underscores)
    if (!SAFE_PATH_SEGMENT.test(segment)) {
      throw new ApiException('Invalid path: forbidden characters', {
        statusCode: 400,
        code: 'INVALID_PATH',
      });
    }
  }
}

function errorResponse(error: ApiException, requestId: string): NextResponse {
  const payload: Record<string, unknown> = {
    error: error.message,
    code: error.code,
    status: error.statusCode,
    request_id: requestId,
  };

  if (error.details !== undefined) {
    payload.details = error.details;
  }

  const response = NextResponse.json(payload, { status: error.statusCode });
  response.headers.set(REQUEST_ID_HEADER, requestId);
  setNoStoreHeaders(response.headers);
  return response;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

/**
 * Extract and parse request body
 */
async function extractBody(request: NextRequest): Promise<unknown> {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null;
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const clonedRequest = request.clone();
      return await clonedRequest.json();
    }
  } catch {
    // No body or non-JSON
  }

  return null;
}

/**
 * Get refresh endpoint path for the current backend
 */
function getRefreshEndpoint(backend: string): string {
  switch (backend) {
    case 'laravel':
      return '/api/v1/auth/refresh';
    case 'symfony':
      return '/api/v1/auth/refresh';
    case 'node':
      return process.env.NODE_AUTH_PREFIX
        ? `${process.env.NODE_AUTH_PREFIX}/refresh`
        : '/api/v1/auth/refresh';
    default:
      return '/api/v1/auth/refresh';
  }
}

/**
 * Attempt to refresh the access token
 */
async function attemptTokenRefresh(
  config: ProxyConfig,
  backend: string,
  refreshToken: string,
  requestId: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const refreshPath = getRefreshEndpoint(backend);
    const refreshUrl = buildBackendUrl(config, refreshPath);

    // Build headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    };

    // Send refresh token in body
    const body = JSON.stringify({
      refresh_token: refreshToken,
      refreshToken: refreshToken, // Some backends expect camelCase
    });

    const response = await apiRequest(refreshUrl.toString(), {
      method: 'POST',
      headers,
      body,
      timeoutMs: config.timeout,
    });

    if (!response.ok) {
      log.warn('Token refresh failed', { status: response.status, backend });
      return null;
    }

    const data = asRecord(await readResponseBody(response));
    const dataContainer = asRecord(data.data);
    return {
      accessToken:
        (dataContainer.access_token as string) ||
        (data.access_token as string) ||
        (data.accessToken as string),
      refreshToken:
        (dataContainer.refresh_token as string) ||
        (data.refresh_token as string) ||
        (data.refreshToken as string) ||
        refreshToken,
      expiresIn:
        (dataContainer.expires_in as number) ||
        (data.expires_in as number) ||
        (data.expiresIn as number) ||
        TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
    };
  } catch (error) {
    const apiError = ApiException.fromUnknown(error, 'Token refresh failed');
    log.error('Token refresh error', {
      error: apiError.message,
      statusCode: apiError.statusCode,
      backend,
    });
    return null;
  }
}

/**
 * Store new tokens in cookies
 */
function storeTokensInResponse(
  response: NextResponse,
  backend: BackendType,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  const cookieNames = getCookieNamesForBackend(backend);
  const actualExpiresIn = Math.max(0, expiresIn);

  // Store access token
  response.cookies.set(cookieNames.accessToken, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: actualExpiresIn,
  });

  // Store expiration for client UX
  const expiresAt = calculateExpirationTimestamp(actualExpiresIn);
  response.cookies.set(cookieNames.tokenExpiresAt, formatExpirationForCookie(expiresAt), {
    ...COOKIE_CONFIG,
    httpOnly: false,
    maxAge: actualExpiresIn,
  });

  // Store refresh token
  response.cookies.set(cookieNames.refreshToken, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
  });
}

/**
 * Clear auth cookies on logout or invalid refresh
 */
function clearAuthCookies(response: NextResponse, backend: BackendType): void {
  const cookieNames = getCookieNamesForBackend(backend);

  response.cookies.delete(cookieNames.accessToken);
  response.cookies.delete(cookieNames.refreshToken);
  response.cookies.delete(cookieNames.tokenExpiresAt);
}

/**
 * Main proxy function to backend
 */
async function proxyRequest(
  request: NextRequest,
  method: string,
  paramsPromise: RouteParams['params']
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const config = getProxyConfig(backend);
  const requestId = getRequestId(request);

  try {
    // Extract path from params
    const params = await paramsPromise;
    const pathSegments = params.path;

    // Validate segments to prevent SSRF
    validatePathSegments(pathSegments);
    validateCsrf(request, method);

    // Build BFF path
    const bffPath = `/api/v1/${pathSegments.join('/')}`;

    // Transform to backend path
    const backendPath = config.transformPath(bffPath);

    // Build full backend URL
    const backendUrl = buildBackendUrl(config, backendPath);

    // Security check: ensure final URL points to configured backend
    const expectedHost = new URL(config.baseUrl).host;
    if (backendUrl.host !== expectedHost) {
      throw new ApiException('Invalid request: host mismatch', {
        statusCode: 400,
        code: 'INVALID_HOST',
      });
    }

    // Extract body
    const body = await extractBody(request);

    // Get tokens from cookies
    const cookieNames = getCookieNamesForBackend(backend);
    let authToken = cookieStore.get(cookieNames.accessToken)?.value;
    const refreshToken = cookieStore.get(cookieNames.refreshToken)?.value;
    let proactivelyRefreshedTokens:
      | { accessToken: string; refreshToken: string; expiresIn: number }
      | null = null;

    // Check if middleware signaled refresh needed
    const refreshNeeded = request.headers.get(REFRESH_NEEDED_HEADER);

    // Proactive refresh if middleware signaled it (and this isn't the refresh endpoint itself)
    if (refreshNeeded && refreshToken && !backendPath.includes('/refresh')) {
      log.info('Attempting proactive token refresh', { refreshNeeded, bffPath });
      const newTokens = await attemptTokenRefresh(config, backend, refreshToken, requestId);
      if (newTokens) {
        proactivelyRefreshedTokens = newTokens;
        authToken = newTokens.accessToken;
        log.info('Proactive refresh successful');
      }
    }

    // Check if route requires authentication
    if (!authToken && !isPublicRoute(config, backendPath)) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No auth token found',
          code: 'UNAUTHORIZED',
          status: 401,
          request_id: requestId,
        },
        {
          status: 401,
          headers: {
            [REQUEST_ID_HEADER]: requestId,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
          },
        }
      );
    }

    // Build request headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    };

    // Add auth token
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Prepare fetch options
    const options: RequestInit = {
      method,
      headers,
    };

    // Add body for mutating requests
    if (method !== 'GET' && method !== 'HEAD' && body) {
      options.body = JSON.stringify(body);
    }

    // Copy query params
    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    // Make request to backend
    let response = await apiRequest(backendUrl.toString(), {
      ...options,
      timeoutMs: config.timeout,
    });

    // 401 Interceptor: Attempt refresh and retry
    if (response.status === 401 && refreshToken && !backendPath.includes('/refresh')) {
      log.info('Received 401, attempting token refresh', { bffPath });

      const newTokens = await attemptTokenRefresh(config, backend, refreshToken, requestId);

      if (newTokens) {
        log.info('Refresh successful, retrying request');

        // Retry with new token
        headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

        response = await apiRequest(backendUrl.toString(), {
          ...options,
          headers,
          timeoutMs: config.timeout,
        });

        // Create response and store new tokens
        const responseData = await response.text();
        const nextResponse = await buildResponse(response, responseData, backend, requestId);
        storeTokensInResponse(
          nextResponse,
          backend,
          newTokens.accessToken,
          newTokens.refreshToken,
          newTokens.expiresIn
        );
        return nextResponse;
      }

      log.warn('Refresh failed, clearing auth cookies');
      // Refresh failed - clear cookies and return 401
      const nextResponse = NextResponse.json(
        {
          error: 'Session expired',
          message: 'Please log in again',
          code: 'SESSION_EXPIRED',
          status: 401,
          request_id: requestId,
        },
        {
          status: 401,
          headers: {
            [REQUEST_ID_HEADER]: requestId,
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
          },
        }
      );
      clearAuthCookies(nextResponse, backend);
      return nextResponse;
    }

    // Build and return response
    const responseData = await response.text();
    const nextResponse = await buildResponse(response, responseData, backend, requestId);

    if (proactivelyRefreshedTokens) {
      storeTokensInResponse(
        nextResponse,
        backend,
        proactivelyRefreshedTokens.accessToken,
        proactivelyRefreshedTokens.refreshToken,
        proactivelyRefreshedTokens.expiresIn
      );
    }

    return nextResponse;
  } catch (error) {
    const apiError = ApiException.fromUnknown(error, 'Failed to proxy request');

    if (apiError.statusCode >= 500) {
      log.error('Proxy request failed', {
        backend,
        error: apiError.message,
        statusCode: apiError.statusCode,
        requestId,
      });
    } else {
      log.warn('Proxy request rejected', {
        backend,
        error: apiError.message,
        statusCode: apiError.statusCode,
        requestId,
      });
    }

    return errorResponse(apiError, requestId);
  }
}

/**
 * Build NextResponse from backend response
 */
async function buildResponse(
  response: Response,
  responseData: string,
  backend: BackendType,
  requestId: string
): Promise<NextResponse> {
  // Get response cookies
  const setCookieHeaders = response.headers.getSetCookie();
  const responseHeaders = new Headers();

  // Copy important response headers
  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') {
      responseHeaders.set(key, value);
    }
  });
  responseHeaders.set(REQUEST_ID_HEADER, requestId);
  setNoStoreHeaders(responseHeaders);

  // Transfer cookies from backend
  setCookieHeaders.forEach((cookie) => {
    responseHeaders.append('set-cookie', cookie);
  });

  // Create Next.js response
  const nextResponse = new NextResponse(responseData, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });

  // Handle token storage based on backend response format
  try {
    const jsonData = JSON.parse(responseData);
    let accessToken: string | undefined;
    let refreshTokenFromResponse: string | undefined;
    let expiresIn: number | undefined;
    const cookieNames = getCookieNamesForBackend(backend);

    // Extract token based on backend format
    if (backend === 'laravel') {
      // Laravel envelope: { success, data: { user, access_token, ... } } or old { data: { access_token } }
      accessToken = jsonData.data?.access_token;
      refreshTokenFromResponse = jsonData.data?.refresh_token;
      expiresIn = jsonData.data?.expires_in;
    } else {
      // Symfony/Node: check envelope format first, then fallback to root
      const envelope = jsonData.data && typeof jsonData.data === 'object' ? jsonData.data : null;
      accessToken = envelope?.access_token || envelope?.accessToken || jsonData.access_token || jsonData.accessToken;
      refreshTokenFromResponse = envelope?.refresh_token || envelope?.refreshToken || jsonData.refresh_token || jsonData.refreshToken;
      expiresIn = envelope?.expires_in || envelope?.expiresIn || jsonData.expires_in || jsonData.expiresIn;
    }

    // Store tokens if present
    if (accessToken) {
      const tokenMaxAge = Math.max(
        0,
        expiresIn || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
      );

      nextResponse.cookies.set(cookieNames.accessToken, accessToken, {
        ...COOKIE_CONFIG,
        maxAge: tokenMaxAge,
      });

      // Set expiration cookie for client UX
      const expiresAt = calculateExpirationTimestamp(tokenMaxAge);
      nextResponse.cookies.set(cookieNames.tokenExpiresAt, formatExpirationForCookie(expiresAt), {
        ...COOKIE_CONFIG,
        httpOnly: false,
        maxAge: tokenMaxAge,
      });
    }

    // Handle refresh token if present
    if (refreshTokenFromResponse) {
      nextResponse.cookies.set(cookieNames.refreshToken, refreshTokenFromResponse, {
        ...COOKIE_CONFIG,
        maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
      });
    }
  } catch {
    // No JSON or no token
  }

  return nextResponse;
}

/**
 * Handlers for each HTTP method
 */
export async function GET(request: NextRequest, params: RouteParams) {
  return proxyRequest(request, 'GET', params.params);
}

export async function POST(request: NextRequest, params: RouteParams) {
  return proxyRequest(request, 'POST', params.params);
}

export async function PUT(request: NextRequest, params: RouteParams) {
  return proxyRequest(request, 'PUT', params.params);
}

export async function PATCH(request: NextRequest, params: RouteParams) {
  return proxyRequest(request, 'PATCH', params.params);
}

export async function DELETE(request: NextRequest, params: RouteParams) {
  return proxyRequest(request, 'DELETE', params.params);
}

/**
 * Configure route options
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Disable cache for sensitive routes
