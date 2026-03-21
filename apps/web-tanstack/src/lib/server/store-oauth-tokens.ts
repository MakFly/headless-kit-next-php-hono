import { createServerFn } from '@tanstack/react-start'
import { getAuthAdapter, toUser } from '@/lib/adapters'

type StoreOAuthTokensInput = {
  access_token: string
  refresh_token?: string | null
  expires_in?: number | null
}

type StoreOAuthTokensResult =
  | { success: true; user: ReturnType<typeof toUser> }
  | { success: false; error: string }

/**
 * Stores OAuth tokens received in the callback URL into HttpOnly cookies.
 * Only functional with the Laravel backend (others return providers: []).
 */
export const storeOAuthTokensFn = createServerFn({ method: 'POST' })
  .inputValidator((data: StoreOAuthTokensInput) => data)
  .handler(async ({ data }): Promise<StoreOAuthTokensResult> => {
    try {
      const adapter = getAuthAdapter()

      await adapter.storeTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token ?? undefined,
        expires_in: data.expires_in ?? undefined,
      })

      const normalizedUser = await adapter.getUser()
      if (!normalizedUser) {
        return { success: false, error: 'Failed to retrieve user after storing tokens' }
      }

      return { success: true, user: toUser(normalizedUser) }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to store OAuth tokens'
      return { success: false, error: message }
    }
  })
