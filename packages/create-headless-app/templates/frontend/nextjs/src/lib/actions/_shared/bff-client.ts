/**
 * BFF HTTP Client for Server Actions
 *
 * Handles authenticated requests from Server Actions to the BFF.
 *
 * IMPORTANT: credentials: 'include' does NOT work for server-to-server requests.
 * Must pass cookie manually in headers.
 */

'use server';

import { cookies } from 'next/headers';
import { env } from '@/lib/config/env';
import { BffActionError } from './errors';
import { ApiException, apiRequestJson } from '@/lib/http';
import type { BffRequestOptions } from './types';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';

const BFF_URL = env.NEXT_PUBLIC_APP_URL;
const REQUEST_ID_HEADER = 'x-request-id';

export async function bffRequest<T>(
  endpoint: string,
  options: BffRequestOptions = {}
): Promise<T> {
  const url = `${BFF_URL}${endpoint}`;
  const { skipAuth, ...fetchOptions } = options;

  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);

  const authToken = cookieStore.get(cookieNames.accessToken);
  const refreshToken = cookieStore.get(cookieNames.refreshToken);
  const backendCookie = cookieStore.get(AUTH_BACKEND_COOKIE);

  // Server-to-server fetch: the runtime does not set Origin, so we must
  // forward the BFF's own origin to satisfy the CSRF check on /api/v1/*.
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Origin: BFF_URL,
    [REQUEST_ID_HEADER]: crypto.randomUUID(),
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const forwardedCookies: string[] = [];

    if (authToken?.value) {
      forwardedCookies.push(`${cookieNames.accessToken}=${authToken.value}`);
    }

    if (refreshToken?.value) {
      forwardedCookies.push(`${cookieNames.refreshToken}=${refreshToken.value}`);
    }

    if (backendCookie?.value) {
      forwardedCookies.push(`${AUTH_BACKEND_COOKIE}=${backendCookie.value}`);
    }

    if (forwardedCookies.length > 0) {
      (headers as Record<string, string>)['Cookie'] = forwardedCookies.join('; ');
    }
  }

  try {
    return await apiRequestJson<T>(url, {
      ...fetchOptions,
      headers,
    });
  } catch (error) {
    const normalized = ApiException.fromUnknown(error, 'Request failed');
    throw new BffActionError(
      normalized.message,
      normalized.statusCode,
      normalized.code,
      normalized.details
    );
  }
}

export async function bffGet<T>(
  endpoint: string,
  options?: Omit<BffRequestOptions, 'method' | 'body'>
): Promise<T> {
  return bffRequest<T>(endpoint, { ...options, method: 'GET' });
}

export async function bffPost<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<BffRequestOptions, 'method' | 'body'>
): Promise<T> {
  return bffRequest<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function bffPut<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<BffRequestOptions, 'method' | 'body'>
): Promise<T> {
  return bffRequest<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function bffPatch<T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<BffRequestOptions, 'method' | 'body'>
): Promise<T> {
  return bffRequest<T>(endpoint, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function bffDelete<T>(
  endpoint: string,
  options?: Omit<BffRequestOptions, 'method' | 'body'>
): Promise<T> {
  return bffRequest<T>(endpoint, { ...options, method: 'DELETE' });
}
