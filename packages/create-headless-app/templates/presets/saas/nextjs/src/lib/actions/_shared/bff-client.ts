/**
 * BFF HTTP Client for Server Actions
 *
 * Handles authenticated requests from Server Actions to the BFF.
 * Cookies must be passed manually for server-to-server requests.
 */

'use server';

import { cookies } from 'next/headers';
import { BffActionError } from './errors';
import type { BffRequestOptions } from './types';

const BFF_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'auth_token';
const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'refresh_token';

export async function bffRequest<T>(
  endpoint: string,
  options: BffRequestOptions = {}
): Promise<T> {
  const url = `${BFF_URL}${endpoint}`;
  const { skipAuth, ...fetchOptions } = options;

  const cookieStore = await cookies();
  const authToken = cookieStore.get(AUTH_COOKIE_NAME);
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME);

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-bff-internal': '1',
    'x-request-id': crypto.randomUUID(),
    ...fetchOptions.headers,
  };

  if (!skipAuth) {
    const forwardedCookies: string[] = [];

    if (authToken?.value) {
      forwardedCookies.push(`${AUTH_COOKIE_NAME}=${authToken.value}`);
    }

    if (refreshToken?.value) {
      forwardedCookies.push(`${REFRESH_COOKIE_NAME}=${refreshToken.value}`);
    }

    if (forwardedCookies.length > 0) {
      (headers as Record<string, string>)['Cookie'] = forwardedCookies.join('; ');
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new BffActionError(
      errorBody?.message || `Request failed with status ${response.status}`,
      response.status,
      errorBody?.code,
      errorBody?.details
    );
  }

  return response.json();
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
