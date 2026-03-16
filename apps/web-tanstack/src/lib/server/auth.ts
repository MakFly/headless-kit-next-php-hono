import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { COOKIE_NAMES, getAuthAdapter, toUser } from '../adapters'
import { ApiException } from '../http'

function getExpiresInFromCookie(): number | null {
  const expiresValue = getCookie(COOKIE_NAMES.TOKEN_EXPIRES_AT)
  if (!expiresValue) return null

  const expiresAt = new Date(expiresValue).getTime()
  if (isNaN(expiresAt)) return null

  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
}

function isAuthFailure(error: unknown): boolean {
  const status = ApiException.getStatusCode(error)
  return status === 400 || status === 401 || status === 403
}

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    const response = await adapter.login(data)
    return {
      user: toUser(response.user),
      expiresIn: response.tokens.expires_in ?? null,
    }
  })

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      email: string
      password: string
      password_confirmation: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    const response = await adapter.register(data)
    return {
      user: toUser(response.user),
      expiresIn: response.tokens.expires_in ?? null,
    }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const adapter = getAuthAdapter()
  await adapter.logout()
  return { success: true }
})

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const adapter = getAuthAdapter()
    let normalized = await adapter.getUser()
    let expiresIn: number | null = null

    if (!normalized) {
      const refreshToken = getCookie(COOKIE_NAMES.REFRESH_TOKEN)
      if (!refreshToken) return null

      try {
        const refreshed = await adapter.refresh({ refresh_token: refreshToken })
        normalized = refreshed.user
        expiresIn = refreshed.tokens.expires_in ?? null
      } catch (error) {
        if (isAuthFailure(error)) {
          await adapter.clearTokens()
        }
        return null
      }
    }

    if (!normalized) return null

    if (expiresIn == null) {
      expiresIn = getExpiresInFromCookie()
    }

    return { user: toUser(normalized), expiresIn }
  },
)

export const refreshTokenFn = createServerFn({ method: 'POST' }).handler(
  async () => {
    const adapter = getAuthAdapter()
    const response = await adapter.refresh()
    return {
      user: toUser(response.user),
      expiresIn: response.tokens.expires_in ?? null,
    }
  },
)

export const getOAuthUrlFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { provider: string }) => data)
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    const url = await adapter.getOAuthUrl(data.provider)
    return { url }
  })
