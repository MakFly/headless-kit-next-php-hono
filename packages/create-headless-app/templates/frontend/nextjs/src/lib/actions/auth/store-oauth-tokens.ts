'use server';

import { getAuthAdapter, toUser } from '@/lib/adapters';
import { cookies } from 'next/headers';
import { AUTH_BACKEND_COOKIE, resolveBackend } from '@/lib/auth/backend-context';
import type { User } from '@/types';

export type StoreOAuthTokensResult =
  | { success: true; user: User }
  | { success: false; error: string };

/**
 * Stores OAuth tokens received in the callback URL into HttpOnly cookies.
 * Only functional with the Laravel backend (others return providers: []).
 */
export async function storeOAuthTokensAction(params: {
  access_token: string;
  refresh_token?: string | null;
  expires_in?: number | null;
}): Promise<StoreOAuthTokensResult> {
  try {
    const cookieStore = await cookies();
    const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
    const adapter = getAuthAdapter(backend);

    await adapter.storeTokens({
      access_token: params.access_token,
      refresh_token: params.refresh_token ?? undefined,
      expires_in: params.expires_in ?? undefined,
    });

    const normalizedUser = await adapter.getUser();
    if (!normalizedUser) {
      return { success: false, error: 'Failed to retrieve user after storing tokens' };
    }

    return { success: true, user: toUser(normalizedUser) };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to store OAuth tokens';
    return { success: false, error: message };
  }
}
