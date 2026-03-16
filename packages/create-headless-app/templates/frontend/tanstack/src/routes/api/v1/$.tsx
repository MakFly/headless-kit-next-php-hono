import { createFileRoute } from '@tanstack/react-router';
import {
  getCookie,
  setCookie,
  deleteCookie,
} from '@tanstack/react-start/server';
import { ApiException, apiRequest, readResponseBody } from '@/lib/http';
import {
  TOKEN_CONFIG,
  COOKIE_NAMES,
  calculateExpirationTimestamp,
  formatExpirationForCookie,
  shouldRefreshByTimestamp,
} from '@/lib/services/token-service';

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/;
const REQUEST_ID_HEADER = 'x-request-id';
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

type BackendType = 'laravel' | 'symfony' | 'node';

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

function getRequestId(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) || crypto.randomUUID();
}

function jsonErrorResponse(
  message: string,
  status: number,
  code?: string,
  requestId?: string,
): Response {
  const payload: Record<string, unknown> = { error: message, code, status };
  if (requestId) payload.request_id = requestId;
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (requestId) headers.set(REQUEST_ID_HEADER, requestId);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  return new Response(JSON.stringify(payload), { status, headers });
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};
}

function validatePathSegments(segments: string[]): void {
  for (const segment of segments) {
    if (!segment || segment === '..' || segment === '.') {
      throw new ApiException('Invalid path', { statusCode: 400, code: 'INVALID_PATH' });
    }
    if (!SAFE_PATH_SEGMENT.test(segment)) {
      throw new ApiException('Invalid path: forbidden characters', { statusCode: 400, code: 'INVALID_PATH' });
    }
  }
}

function getBackendType(): BackendType {
  const backend = process.env.AUTH_BACKEND || 'laravel';
  if (backend !== 'laravel' && backend !== 'symfony' && backend !== 'node') {
    return 'laravel';
  }
  return backend;
}

function getBackendBaseUrl(backend: BackendType): string {
  switch (backend) {
    case 'laravel':
      return process.env.LARAVEL_API_URL || 'http://localhost:8000';
    case 'symfony':
      return process.env.SYMFONY_API_URL || 'http://localhost:8002';
    case 'node':
      return process.env.NODE_API_URL || 'http://localhost:8003';
  }
}

function transformPath(backend: BackendType, bffPath: string): string {
  if (backend === 'symfony') return bffPath.replace('/api/v1', '/api');
  return bffPath;
}

function isPublicRoute(path: string): boolean {
  const publicPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
  ];
  return publicPaths.some((p) => path === p || path.startsWith(p + '/'));
}

async function attemptTokenRefresh(
  backend: BackendType,
  refreshToken: string,
  requestId: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number } | null> {
  try {
    const baseUrl = getBackendBaseUrl(backend).replace(/\/$/, '');
    const refreshPath = '/api/v1/auth/refresh';
    const backendPath = transformPath(backend, refreshPath);
    const url = new URL(backendPath, baseUrl);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    };

    const body = backend === 'laravel'
      ? { refresh_token: refreshToken }
      : { refresh_token: refreshToken, refreshToken: refreshToken };

    const response = await apiRequest(url.toString(), {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeoutMs: 30000,
    });

    if (backend === 'laravel') {
      if (!response.ok) return null;
      const data = asRecord(await readResponseBody(response));
      const dataContainer = asRecord(data.data);
      return {
        accessToken: (dataContainer.access_token as string) || (data.access_token as string),
        refreshToken: (dataContainer.refresh_token as string) || (data.refresh_token as string) || refreshToken,
        expiresIn: (dataContainer.expires_in as number) || (data.expires_in as number) || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
      };
    }
    if (!response.ok) return null;
    const data = asRecord(await readResponseBody(response));
    return {
      accessToken: (data.access_token as string) || (data.accessToken as string),
      refreshToken: (data.refresh_token as string) || (data.refreshToken as string) || refreshToken,
      expiresIn: (data.expires_in as number) || (data.expiresIn as number) || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
    };
  } catch {
    return null;
  }
}

async function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  if (accessToken) {
    setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, { ...COOKIE_CONFIG, maxAge: expiresIn });
    const expiresAt = calculateExpirationTimestamp(expiresIn);
    setCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT, formatExpirationForCookie(expiresAt), {
      ...COOKIE_CONFIG,
      httpOnly: false,
      maxAge: expiresIn,
    });
  }
  if (refreshToken) {
    setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      ...COOKIE_CONFIG,
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
    });
  }
}

async function clearAuthCookies(): Promise<void> {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN);
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN);
  deleteCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT);
}

async function handleBffRequest(request: Request): Promise<Response> {
  const backend = getBackendType();
  const requestId = getRequestId(request);

  try {
    const url = new URL(request.url);
    const pathSegments = url.pathname
      .replace(/^\/api\/v1\//, '')
      .split('/')
      .filter(Boolean);

    if (pathSegments.length === 0) {
      throw new ApiException('Missing path', { statusCode: 400, code: 'MISSING_PATH' });
    }

    validatePathSegments(pathSegments);

    const bffPath = `/api/v1/${pathSegments.join('/')}`;
    const backendPath = transformPath(backend, bffPath);
    const baseUrl = getBackendBaseUrl(backend).replace(/\/$/, '');
    const backendUrl = new URL(backendPath, baseUrl);

    const method = request.method;
    let body: unknown = null;
    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.json();
      } catch {}
    }

    let authToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN) ?? undefined;
    const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN) ?? undefined;
    const tokenExpiresAt = getCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT) ?? undefined;

    // Proactive token refresh
    if (authToken && tokenExpiresAt && refreshToken && !backendPath.includes('/refresh')) {
      if (shouldRefreshByTimestamp(tokenExpiresAt)) {
        const newTokens = await attemptTokenRefresh(backend, refreshToken, requestId);
        if (newTokens) {
          authToken = newTokens.accessToken;
          await storeTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.expiresIn);
        }
      }
    }

    if (!authToken && !isPublicRoute(backendPath)) {
      return jsonErrorResponse('No auth token found', 401, 'UNAUTHORIZED', requestId);
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    };

    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const options: RequestInit = { method, headers: requestHeaders };
    if (method !== 'GET' && method !== 'HEAD' && body) {
      options.body = JSON.stringify(body);
    }

    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    let response = await apiRequest(backendUrl.toString(), { ...options, timeoutMs: 30000 });

    // Handle 401 with refresh
    if (response.status === 401 && refreshToken && !backendPath.includes('/refresh')) {
      const newTokens = await attemptTokenRefresh(backend, refreshToken, requestId);
      if (newTokens) {
        requestHeaders['Authorization'] = `Bearer ${newTokens.accessToken}`;
        response = await apiRequest(backendUrl.toString(), {
          ...options,
          headers: requestHeaders,
          timeoutMs: 30000,
        });
        await storeTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.expiresIn);
      } else {
        await clearAuthCookies();
        return jsonErrorResponse('Session expired', 401, 'SESSION_EXPIRED', requestId);
      }
    }

    const responseData = await response.text();
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key !== 'set-cookie') responseHeaders.set(key, value);
    });
    responseHeaders.set(REQUEST_ID_HEADER, requestId);
    responseHeaders.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    // Extract and store tokens from auth responses
    try {
      const jsonData = JSON.parse(responseData);
      let accessToken: string | undefined;
      let refreshTokenFromResponse: string | undefined;
      let expiresIn: number | undefined;

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
        const tokenMaxAge = expiresIn || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE;
        setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, { ...COOKIE_CONFIG, maxAge: tokenMaxAge });
        const expiresAt = calculateExpirationTimestamp(tokenMaxAge);
        setCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT, formatExpirationForCookie(expiresAt), {
          ...COOKIE_CONFIG,
          httpOnly: false,
          maxAge: tokenMaxAge,
        });
      }

      if (refreshTokenFromResponse) {
        setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshTokenFromResponse, {
          ...COOKIE_CONFIG,
          maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
        });
      }
    } catch {}

    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const apiError = ApiException.fromUnknown(error, 'Failed to proxy request');
    return jsonErrorResponse(apiError.message, apiError.statusCode, apiError.code, requestId);
  }
}

export const Route = createFileRoute('/api/v1/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => handleBffRequest(request),
      POST: async ({ request }: { request: Request }) => handleBffRequest(request),
      PUT: async ({ request }: { request: Request }) => handleBffRequest(request),
      PATCH: async ({ request }: { request: Request }) => handleBffRequest(request),
      DELETE: async ({ request }: { request: Request }) => handleBffRequest(request),
    },
  },
});
