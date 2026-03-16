/**
 * BFF Route Handler
 *
 * This catch-all handler proxies all /api/v1/* requests to the configured backend
 * (Laravel, Symfony, or Node.js) based on AUTH_BACKEND environment variable.
 *
 * Features:
 * - Bearer token forwarding for all backends
 * - 401 Interceptor: Automatic token refresh on 401 responses
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
import { ApiException, apiRequest, readResponseBody } from '@/lib/http';
import {
  TOKEN_CONFIG,
  calculateExpirationTimestamp,
  formatExpirationForCookie,
} from '@/lib/services/token-service';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';

/**
 * Type for Next.js 14+ dynamic route params
 */
type RouteParams = {
  params: Promise<{ path: string[] }>;
};

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;
const REQUEST_ID_HEADER = 'x-request-id';
const INTERNAL_REQUEST_HEADER = 'x-bff-internal';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

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
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function validateCsrf(request: NextRequest, method: string): void {
  if (!MUTATING_METHODS.has(method)) return;
  if (request.headers.get(INTERNAL_REQUEST_HEADER) === '1') return;

  const expectedOrigin = request.nextUrl.origin;
  const origin = request.headers.get('origin');
  const refererOrigin = getOriginFromReferer(request.headers.get('referer'));

  if (origin && origin === expectedOrigin) return;
  if (!origin && refererOrigin && refererOrigin === expectedOrigin) return;

  throw new ApiException('CSRF validation failed', {
    statusCode: 403,
    code: origin || refererOrigin ? 'CSRF_ORIGIN_MISMATCH' : 'CSRF_MISSING_ORIGIN',
  });
}

function validatePathSegments(segments: string[]): void {
  for (const segment of segments) {
    if (!segment) {
      throw new ApiException('Invalid path: empty segment', { statusCode: 400, code: 'INVALID_PATH' });
    }
    if (segment === '..' || segment === '.') {
      throw new ApiException('Invalid path: traversal not allowed', { statusCode: 400, code: 'INVALID_PATH' });
    }
    if (segment.includes('://') || segment.startsWith('//')) {
      throw new ApiException('Invalid path: absolute URLs not allowed', { statusCode: 400, code: 'INVALID_PATH' });
    }
    if (!SAFE_PATH_SEGMENT.test(segment)) {
      throw new ApiException('Invalid path: forbidden characters', { statusCode: 400, code: 'INVALID_PATH' });
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

async function extractBody(request: NextRequest): Promise<unknown> {
  if (request.method === 'GET' || request.method === 'HEAD') return null;

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

async function attemptTokenRefresh(
  config: ProxyConfig,
  backend: string,
  refreshToken: string,
  requestId: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const refreshPath = getRefreshEndpoint(backend);
    const refreshUrl = buildBackendUrl(config, refreshPath);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    };

    const body = JSON.stringify(
      backend === 'laravel'
        ? { refresh_token: refreshToken }
        : { refresh_token: refreshToken, refreshToken: refreshToken }
    );

    const response = await apiRequest(refreshUrl.toString(), {
      method: 'POST',
      headers,
      body,
      timeoutMs: config.timeout,
    });

    if (backend === 'laravel') {
      if (!response.ok) return null;

      const data = asRecord(await readResponseBody(response));
      const dataContainer = asRecord(data.data);
      return {
        accessToken:
          (dataContainer.access_token as string) ||
          (data.access_token as string),
        refreshToken:
          (dataContainer.refresh_token as string) ||
          (data.refresh_token as string) ||
          refreshToken,
        expiresIn:
          ((dataContainer.expires_in as number) ||
            (data.expires_in as number) ||
            TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE),
      };
    }

    if (!response.ok) return null;

    const data = asRecord(await readResponseBody(response));
    return {
      accessToken: (data.access_token as string) || (data.accessToken as string),
      refreshToken:
        (data.refresh_token as string) || (data.refreshToken as string) || refreshToken,
      expiresIn:
        (data.expires_in as number) ||
        (data.expiresIn as number) ||
        TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
    };
  } catch {
    return null;
  }
}

function storeTokensInResponse(
  response: NextResponse,
  backend: BackendType,
  accessToken: string,
  refreshToken: string,
  expiresIn: number
): void {
  const cookieNames = getCookieNamesForBackend(backend);
  const actualExpiresIn = Math.max(0, expiresIn);

  response.cookies.set(cookieNames.accessToken, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: actualExpiresIn,
  });

  const expiresAt = calculateExpirationTimestamp(actualExpiresIn);
  response.cookies.set(cookieNames.tokenExpiresAt, formatExpirationForCookie(expiresAt), {
    ...COOKIE_CONFIG,
    httpOnly: false,
    maxAge: actualExpiresIn,
  });

  response.cookies.set(cookieNames.refreshToken, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
  });
}

function clearAuthCookies(response: NextResponse, backend: BackendType): void {
  const cookieNames = getCookieNamesForBackend(backend);
  response.cookies.delete(cookieNames.accessToken);
  response.cookies.delete(cookieNames.refreshToken);
  response.cookies.delete(cookieNames.tokenExpiresAt);
}

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
    const params = await paramsPromise;
    const pathSegments = params.path;

    validatePathSegments(pathSegments);
    validateCsrf(request, method);

    const bffPath = `/api/v1/${pathSegments.join('/')}`;
    const backendPath = config.transformPath(bffPath);
    const backendUrl = buildBackendUrl(config, backendPath);

    const expectedHost = new URL(config.baseUrl).host;
    if (backendUrl.host !== expectedHost) {
      throw new ApiException('Invalid request: host mismatch', {
        statusCode: 400,
        code: 'INVALID_HOST',
      });
    }

    const body = await extractBody(request);

    const cookieNames = getCookieNamesForBackend(backend);
    let authToken = cookieStore.get(cookieNames.accessToken)?.value;
    const refreshToken = cookieStore.get(cookieNames.refreshToken)?.value;

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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (method !== 'GET' && method !== 'HEAD' && body) {
      options.body = JSON.stringify(body);
    }

    request.nextUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    let response = await apiRequest(backendUrl.toString(), {
      ...options,
      timeoutMs: config.timeout,
    });

    // 401 Interceptor: Attempt refresh and retry
    if (response.status === 401 && refreshToken && !backendPath.includes('/refresh')) {
      const newTokens = await attemptTokenRefresh(config, backend, refreshToken, requestId);

      if (newTokens) {
        headers['Authorization'] = `Bearer ${newTokens.accessToken}`;

        response = await apiRequest(backendUrl.toString(), {
          ...options,
          headers,
          timeoutMs: config.timeout,
        });

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

    const responseData = await response.text();
    return await buildResponse(response, responseData, backend, requestId);
  } catch (error) {
    const apiError = ApiException.fromUnknown(error, 'Failed to proxy request');
    return errorResponse(apiError, requestId);
  }
}

async function buildResponse(
  response: Response,
  responseData: string,
  backend: BackendType,
  requestId: string
): Promise<NextResponse> {
  const setCookieHeaders = response.headers.getSetCookie();
  const responseHeaders = new Headers();

  response.headers.forEach((value, key) => {
    if (key !== 'set-cookie') {
      responseHeaders.set(key, value);
    }
  });
  responseHeaders.set(REQUEST_ID_HEADER, requestId);
  setNoStoreHeaders(responseHeaders);

  setCookieHeaders.forEach((cookie) => {
    responseHeaders.append('set-cookie', cookie);
  });

  const nextResponse = new NextResponse(responseData, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });

  try {
    const jsonData = JSON.parse(responseData);
    let accessToken: string | undefined;
    let refreshTokenFromResponse: string | undefined;
    let expiresIn: number | undefined;
    const cookieNames = getCookieNamesForBackend(backend);

    if (backend === 'laravel') {
      accessToken = jsonData.data?.access_token;
      refreshTokenFromResponse = jsonData.data?.refresh_token;
      expiresIn = jsonData.data?.expires_in;
    } else {
      accessToken = jsonData.access_token || jsonData.accessToken;
      refreshTokenFromResponse = jsonData.refresh_token || jsonData.refreshToken;
      expiresIn = jsonData.expires_in || jsonData.expiresIn;
    }

    if (accessToken) {
      const tokenMaxAge = Math.max(
        0,
        expiresIn || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE
      );

      nextResponse.cookies.set(cookieNames.accessToken, accessToken, {
        ...COOKIE_CONFIG,
        maxAge: tokenMaxAge,
      });

      const expiresAt = calculateExpirationTimestamp(tokenMaxAge);
      nextResponse.cookies.set(cookieNames.tokenExpiresAt, formatExpirationForCookie(expiresAt), {
        ...COOKIE_CONFIG,
        httpOnly: false,
        maxAge: tokenMaxAge,
      });
    }

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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
