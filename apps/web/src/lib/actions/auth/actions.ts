/**
 * Server Actions for authentication
 */

'use server';

import type { User, LoginCredentials, RegisterData, AuthTokens, ApiResponse } from '@/types';
import { cookies } from 'next/headers';
import { getAuthAdapter, toUser, AdapterError } from '../../adapters';
import { createLogger } from '@/lib/logger';
import { AuthActionError, throwAuthError } from '../_shared/errors';
import { AUTH_BACKEND_COOKIE, resolveBackend } from '@/lib/auth/backend-context';

const log = createLogger('auth');

async function getCurrentBackend() {
  const cookieStore = await cookies();
  return resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
}

export async function registerAction(
  data: RegisterData
): Promise<ApiResponse<{ user: User; access_token: string }>> {
  try {
    const backend = await getCurrentBackend();
    const adapter = getAuthAdapter(backend);
    const response = await adapter.register({
      name: data.name,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation,
    });

    return {
      data: {
        user: toUser(response.user),
        access_token: response.tokens.access_token,
      },
    };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function loginAction(
  credentials: LoginCredentials
): Promise<ApiResponse<{ user: User; access_token: string }>> {
  try {
    const backend = await getCurrentBackend();
    const adapter = getAuthAdapter(backend);
    const response = await adapter.login({
      email: credentials.email,
      password: credentials.password,
    });

    return {
      data: {
        user: toUser(response.user),
        access_token: response.tokens.access_token,
      },
    };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function logoutAction(): Promise<void> {
  const backend = await getCurrentBackend();

  try {
    const adapter = getAuthAdapter(backend);
    await adapter.logout();
  } catch (error) {
    log.error('Logout error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      backend,
    });

    const adapter = getAuthAdapter(backend);
    await adapter.clearTokens();
  }
}

export async function refreshTokenAction(): Promise<ApiResponse<AuthTokens>> {
  try {
    const backend = await getCurrentBackend();
    const adapter = getAuthAdapter(backend);
    const response = await adapter.refresh();

    return {
      data: {
        access_token: response.tokens.access_token,
        token_type: (response.tokens.token_type as 'Bearer') || 'Bearer',
        expires_in: response.tokens.expires_in || 3600,
        refresh_token: response.tokens.refresh_token,
      },
    };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function getCurrentUserAction(): Promise<User | null> {
  try {
    const backend = await getCurrentBackend();
    const adapter = getAuthAdapter(backend);
    const user = await adapter.getUser();

    if (!user) {
      return null;
    }

    return toUser(user);
  } catch (error) {
    if (error instanceof AdapterError) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        return null;
      }
    }

    throw error;
  }
}

export async function getOAuthProvidersAction(): Promise<ApiResponse<string[]>> {
  try {
    const backend = await getCurrentBackend();
    const adapter = getAuthAdapter(backend);
    const providers = await adapter.getOAuthProviders();

    return {
      data: providers,
    };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function getOAuthUrlAction(provider: string): Promise<{ url: string }> {
  try {
    const backend = await getCurrentBackend();
    const adapter = getAuthAdapter(backend);
    const url = await adapter.getOAuthUrl(provider);

    return { url };
  } catch (error) {
    throwAuthError(error);
  }
}

export async function sendMagicLinkAction(email: string): Promise<ApiResponse<{ message: string }>> {
  try {
    const backend = await getCurrentBackend();

    if (backend !== 'laravel') {
      throw new AuthActionError(
        'Magic link is only available on Laravel backend',
        400,
        'MAGIC_LINK_UNSUPPORTED'
      );
    }

    const adapter = getAuthAdapter(backend);
    if (!adapter.sendMagicLink) {
      throw new AuthActionError('Magic link is not available for this backend', 400, 'MAGIC_LINK_UNSUPPORTED');
    }

    await adapter.sendMagicLink(email);

    return {
      data: {
        message: 'Magic link sent successfully',
      },
    };
  } catch (error) {
    throwAuthError(error);
  }
}

export { AuthActionError };
