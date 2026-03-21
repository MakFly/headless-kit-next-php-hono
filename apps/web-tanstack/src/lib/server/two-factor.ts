import { createServerFn } from '@tanstack/react-start'
import { getAuthAdapter, toUser } from '../adapters'

export const get2faStatusFn = createServerFn({ method: 'GET' }).handler(async () => {
  const adapter = getAuthAdapter()
  return adapter.get2faStatus()
})

export const setup2faFn = createServerFn({ method: 'POST' }).handler(async () => {
  const adapter = getAuthAdapter()
  return adapter.setup2fa()
})

export const enable2faFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    return adapter.enable2fa(data.code)
  })

export const verify2faFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    const response = await adapter.verify2fa(data.code)
    return { user: toUser(response.user), expiresIn: response.tokens.expires_in ?? null }
  })

export const disable2faFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    return adapter.disable2fa(data.code)
  })

export const verify2faRecoveryFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { code: string }) => data)
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    const response = await adapter.verify2faRecovery(data.code)
    return { user: toUser(response.user), expiresIn: response.tokens.expires_in ?? null }
  })

export const getRecoveryCodesFn = createServerFn({ method: 'GET' }).handler(async () => {
  const adapter = getAuthAdapter()
  return adapter.getRecoveryCodes()
})
