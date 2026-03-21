import { createFileRoute } from '@tanstack/react-router'
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import type {AdapterConfig, BackendType} from '@/lib/adapters';
import {
  
  
  getAdapterConfig
} from '@/lib/adapters'
import { ApiException, apiRequest, readResponseBody } from '@/lib/http'
import {
  COOKIE_NAMES,
  TOKEN_CONFIG,
  calculateExpirationTimestamp,
  formatExpirationForCookie,
  shouldRefreshByTimestamp,
} from '@/lib/services/token-service'

const SAFE_PATH_SEGMENT = /^[a-zA-Z0-9_-]+$/
const REQUEST_ID_HEADER = 'x-request-id'
const INTERNAL_REQUEST_HEADER = 'x-bff-internal'
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

function setNoStoreHeaders(headers: Headers): void {
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  headers.set('Pragma', 'no-cache')
}

function getRequestId(request: Request): string {
  return request.headers.get(REQUEST_ID_HEADER) || crypto.randomUUID()
}

function getOriginFromReferer(referer: string | null): string | null {
  if (!referer) return null
  try {
    return new URL(referer).origin
  } catch {
    return null
  }
}

function validateCsrf(request: Request, method: string): void {
  if (!MUTATING_METHODS.has(method)) return

  if (request.headers.get(INTERNAL_REQUEST_HEADER) === '1') return

  const expectedOrigin = new URL(request.url).origin
  const origin = request.headers.get('origin')
  const refererOrigin = getOriginFromReferer(request.headers.get('referer'))

  if (origin && origin === expectedOrigin) return
  if (!origin && refererOrigin && refererOrigin === expectedOrigin) return

  throw new ApiException('CSRF validation failed', {
    statusCode: 403,
    code: origin || refererOrigin ? 'CSRF_ORIGIN_MISMATCH' : 'CSRF_MISSING_ORIGIN',
  })
}

function jsonErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: unknown,
  requestId?: string,
): Response {
  const payload: Record<string, unknown> = {
    error: message,
    code,
    status,
  }
  if (requestId) {
    payload.request_id = requestId
  }
  if (details !== undefined) {
    payload.details = details
  }
  const headers = new Headers({ 'Content-Type': 'application/json' })
  if (requestId) {
    headers.set(REQUEST_ID_HEADER, requestId)
  }
  setNoStoreHeaders(headers)
  return new Response(JSON.stringify(payload), {
    status,
    headers,
  })
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {}
}

function validatePathSegments(segments: Array<string>): void {
  for (const segment of segments) {
    if (!segment) {
      throw new ApiException('Invalid path: empty segment', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
    if (segment === '..' || segment === '.') {
      throw new ApiException('Invalid path: traversal not allowed', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
    if (segment.includes('://') || segment.startsWith('//')) {
      throw new ApiException('Invalid path: absolute URLs not allowed', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
    if (!SAFE_PATH_SEGMENT.test(segment)) {
      throw new ApiException('Invalid path: forbidden characters', {
        statusCode: 400,
        code: 'INVALID_PATH',
      })
    }
  }
}

function getBackendTypeServer(): BackendType {
  const backend = process.env.AUTH_BACKEND || 'laravel'
  if (backend !== 'laravel' && backend !== 'symfony' && backend !== 'node') {
    console.warn(`Unknown AUTH_BACKEND "${backend}", defaulting to "laravel"`)
    return 'laravel'
  }
  return backend
}

function getProxyConfig() {
  const backend = getBackendTypeServer()
  const config = getAdapterConfig(backend)
  return { backend, config }
}

function buildBackendUrl(config: Partial<AdapterConfig>, path: string): URL {
  const baseUrl = config.baseUrl?.replace(/\/$/, '') || 'http://localhost:8002'
  return new URL(path, baseUrl)
}

function transformPath(backend: BackendType, bffPath: string): string {
  if (backend === 'laravel') return bffPath
  if (backend === 'symfony') return bffPath.replace('/api/v1', '/api')
  if (backend === 'node') {
    const prefix = process.env.NODE_AUTH_PREFIX || '/api/v1/auth'
    return bffPath.replace('/api/v1/auth', prefix)
  }
  return bffPath
}

function getRefreshEndpoint(backend: BackendType): string {
  switch (backend) {
    case 'laravel':
      return '/api/v1/auth/refresh'
    case 'symfony':
      return '/api/v1/auth/refresh'
    case 'node':
      return process.env.NODE_AUTH_PREFIX
        ? `${process.env.NODE_AUTH_PREFIX}/refresh`
        : '/api/v1/auth/refresh'
    default:
      return '/api/v1/auth/refresh'
  }
}

async function attemptTokenRefresh(
  backend: BackendType,
  config: Partial<AdapterConfig>,
  refreshToken: string,
  requestId: string,
): Promise<{
  accessToken: string
  refreshToken: string
  expiresIn: number
} | null> {
  try {
    const refreshPath = getRefreshEndpoint(backend)
    const refreshUrl = buildBackendUrl(config, refreshPath)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    }

    if (backend === 'laravel') {
      const body = { refresh_token: refreshToken }

      const response = await apiRequest(refreshUrl.toString(), {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        timeoutMs: config.timeout || 30000,
      })

      if (!response.ok) return null

      const data = asRecord(await readResponseBody(response))
      const dataContainer = asRecord(data.data)
      return {
        accessToken:
          (dataContainer.access_token as string) ||
          (data.access_token as string),
        refreshToken:
          (dataContainer.refresh_token as string) ||
          (data.refresh_token as string) ||
          refreshToken,
        expiresIn:
          (dataContainer.expires_in as number) ||
          (data.expires_in as number) ||
          TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
      }
    }

    const body = JSON.stringify({
      refresh_token: refreshToken,
      refreshToken: refreshToken,
    })

    const response = await apiRequest(refreshUrl.toString(), {
      method: 'POST',
      headers,
      body,
      timeoutMs: config.timeout || 30000,
    })

    if (!response.ok) return null

    const data = asRecord(await readResponseBody(response))
    return {
      accessToken: (data.access_token as string) || (data.accessToken as string),
      refreshToken:
        (data.refresh_token as string) ||
        (data.refreshToken as string) ||
        refreshToken,
      expiresIn:
        (data.expires_in as number) ||
        (data.expiresIn as number) ||
        TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE,
    }
  } catch (error) {
    const apiError = ApiException.fromUnknown(error, 'Token refresh failed')
    console.error('Token refresh error:', {
      message: apiError.message,
      statusCode: apiError.statusCode,
    })
    return null
  }
}

async function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
): Promise<void> {
  if (accessToken) {
    setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      ...COOKIE_CONFIG,
      maxAge: expiresIn,
    })

    const expiresAt = calculateExpirationTimestamp(expiresIn)
    setCookie(
      COOKIE_NAMES.TOKEN_EXPIRES_AT,
      formatExpirationForCookie(expiresAt),
      {
        ...COOKIE_CONFIG,
        httpOnly: false,
        maxAge: expiresIn,
      },
    )
  }

  if (refreshToken) {
    setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      ...COOKIE_CONFIG,
      maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
    })
  }
}

async function clearAuthCookies(): Promise<void> {
  deleteCookie(COOKIE_NAMES.ACCESS_TOKEN)
  deleteCookie(COOKIE_NAMES.REFRESH_TOKEN)
  deleteCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT)
}

function isPublicRoute(path: string): boolean {
  const publicPaths = [
    '/api/v1/auth/login',
    '/api/v1/auth/register',
    '/api/v1/auth/refresh',
    '/api/v1/auth/providers',
    '/api/v1/auth/test-accounts',
    '/api/v1/auth/{provider}/redirect',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/refresh',
    '/api/auth/providers',
    '/api/auth/test-accounts',
    '/api/auth/{provider}/redirect',
  ]
  return publicPaths.some((p) => {
    if (p.includes('{')) {
      const regex = new RegExp('^' + p.replace(/{[^}]+}/g, '[^/]+') + '$')
      return regex.test(path)
    }
    return path === p || path.startsWith(p + '/')
  })
}

async function handleBffRequest(request: Request): Promise<Response> {
  const { backend, config } = getProxyConfig()
  const requestId = getRequestId(request)
  try {
    const url = new URL(request.url)
    const pathSegments = url.pathname
      .replace(/^\/api\/v1\//, '')
      .split('/')
      .filter(Boolean)

    if (pathSegments.length === 0) {
      throw new ApiException('Missing path', {
        statusCode: 400,
        code: 'MISSING_PATH',
      })
    }

    validatePathSegments(pathSegments)

    const bffPath = `/api/v1/${pathSegments.join('/')}`
    const backendPath = transformPath(backend, bffPath)
    const backendUrl = buildBackendUrl(config, backendPath)

    const expectedHost = new URL(config.baseUrl!).host
    if (backendUrl.host !== expectedHost) {
      throw new ApiException('Invalid request: host mismatch', {
        statusCode: 400,
        code: 'INVALID_HOST',
      })
    }

    const method = request.method
    validateCsrf(request, method)
    let body: unknown = null

    if (method !== 'GET' && method !== 'HEAD') {
      try {
        body = await request.json()
      } catch {}
    }

    let authToken = getCookie(COOKIE_NAMES.ACCESS_TOKEN) ?? undefined
    const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN) ?? undefined

    // Proactive token refresh: check if token expires soon
    const tokenExpiresAt = getCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT) ?? undefined

    if (authToken && tokenExpiresAt && refreshToken && !backendPath.includes('/refresh')) {
      const shouldRefresh = shouldRefreshByTimestamp(tokenExpiresAt)
      if (shouldRefresh) {
        const newTokens = await attemptTokenRefresh(backend, config, refreshToken, requestId)
        if (newTokens) {
          authToken = newTokens.accessToken
          await storeTokens(newTokens.accessToken, newTokens.refreshToken, newTokens.expiresIn)
        }
      }
    }

    if (!authToken && !isPublicRoute(backendPath)) {
      return jsonErrorResponse('No auth token found', 401, 'UNAUTHORIZED', undefined, requestId)
    }

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      [REQUEST_ID_HEADER]: requestId,
    }

    if (authToken) {
      requestHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const options: RequestInit = {
      method,
      headers: requestHeaders,
    }

    if (method !== 'GET' && method !== 'HEAD' && body) {
      options.body = JSON.stringify(body)
    }

    url.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value)
    })

    let response = await apiRequest(backendUrl.toString(), {
      ...options,
      timeoutMs: config.timeout || 30000,
    })

    if (
      response.status === 401 &&
      refreshToken &&
      !backendPath.includes('/refresh')
    ) {
      const newTokens = await attemptTokenRefresh(backend, config, refreshToken, requestId)

      if (newTokens) {
        requestHeaders['Authorization'] = `Bearer ${newTokens.accessToken}`

        response = await apiRequest(backendUrl.toString(), {
          ...options,
          headers: requestHeaders,
          timeoutMs: config.timeout || 30000,
        })

        const responseData = await response.text()
        const headers = new Headers()
        response.headers.forEach((value, key) => {
          if (key !== 'set-cookie') headers.set(key, value)
        })
        headers.set(REQUEST_ID_HEADER, requestId)
        setNoStoreHeaders(headers)
        response.headers
          .getSetCookie()
          .forEach((cookie) => headers.append('set-cookie', cookie))

        await storeTokens(
          newTokens.accessToken,
          newTokens.refreshToken,
          newTokens.expiresIn,
        )

        return new Response(responseData, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      }

      await clearAuthCookies()
      return jsonErrorResponse('Session expired', 401, 'SESSION_EXPIRED', undefined, requestId)
    }

    const responseData = await response.text()
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      if (key !== 'set-cookie') responseHeaders.set(key, value)
    })
    responseHeaders.set(REQUEST_ID_HEADER, requestId)
    setNoStoreHeaders(responseHeaders)
    response.headers
      .getSetCookie()
      .forEach((cookie) => responseHeaders.append('set-cookie', cookie))

    try {
      const jsonData = JSON.parse(responseData)
      let accessToken: string | undefined
      let refreshTokenFromResponse: string | undefined
      let expiresIn: number | undefined

      if (backend === 'laravel') {
        accessToken = jsonData.data?.access_token
        refreshTokenFromResponse = jsonData.data?.refresh_token
        expiresIn = jsonData.data?.expires_in
      } else {
        accessToken = jsonData.access_token || jsonData.accessToken
        refreshTokenFromResponse =
          jsonData.refresh_token || jsonData.refreshToken
        expiresIn = jsonData.expires_in || jsonData.expiresIn
      }

      if (accessToken) {
        const tokenMaxAge = expiresIn || TOKEN_CONFIG.ACCESS_TOKEN_MAX_AGE

        setCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
          ...COOKIE_CONFIG,
          maxAge: tokenMaxAge,
        })

        const expiresAt = calculateExpirationTimestamp(tokenMaxAge)
        setCookie(
          COOKIE_NAMES.TOKEN_EXPIRES_AT,
          formatExpirationForCookie(expiresAt),
          {
            ...COOKIE_CONFIG,
            httpOnly: false,
            maxAge: tokenMaxAge,
          },
        )
      }

      if (refreshTokenFromResponse) {
        setCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshTokenFromResponse, {
          ...COOKIE_CONFIG,
          maxAge: TOKEN_CONFIG.REFRESH_TOKEN_MAX_AGE,
        })
      }
    } catch {}

    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    const apiError = ApiException.fromUnknown(error, 'Failed to proxy request')

    if (apiError.statusCode >= 500) {
      console.error('BFF proxy request failed', {
        message: apiError.message,
        statusCode: apiError.statusCode,
      })
    }

    return jsonErrorResponse(
      apiError.message,
      apiError.statusCode,
      apiError.code,
      apiError.details,
      requestId,
    )
  }
}

export const Route = createFileRoute('/api/v1/$')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handleBffRequest(request as unknown as Request)
      },
      POST: async ({ request }: { request: Request }) => {
        return handleBffRequest(request as unknown as Request)
      },
      PUT: async ({ request }: { request: Request }) => {
        return handleBffRequest(request as unknown as Request)
      },
      PATCH: async ({ request }: { request: Request }) => {
        return handleBffRequest(request as unknown as Request)
      },
      DELETE: async ({ request }: { request: Request }) => {
        return handleBffRequest(request as unknown as Request)
      },
    },
  },
})
