'use client'

import { useCallback, useEffect, useRef } from 'react'
import { refreshTokenFn } from '@/lib/server/auth'
import { ApiException } from '@/lib/http'
import { getStoredExpiresAt, useAuthStore } from '@/stores/auth-store'

interface UseTokenRefreshOptions {
  onExpired?: () => void
}

function getErrorStatus(error: unknown): number | null {
  return ApiException.getStatusCode(error)
}

export function useTokenRefresh({ onExpired }: UseTokenRefreshOptions = {}) {
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const expiresIn = useAuthStore((s) => s.expiresIn)
  const setUser = useAuthStore((s) => s.setUser)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refreshInProgress = useRef(false)
  const lastRefreshAt = useRef(0)
  const retryAttempts = useRef(0)
  const onExpiredRef = useRef(onExpired)
  const hasInitialized = useRef(false)
  onExpiredRef.current = onExpired

  const COOLDOWN_MS = 10000
  const MAX_NETWORK_RETRIES = 2
  const BASE_RETRY_DELAY_MS = 1500

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const doRefresh = useCallback(async () => {
    if (refreshInProgress.current) return
    if (Date.now() - lastRefreshAt.current < COOLDOWN_MS) return

    refreshInProgress.current = true
    try {
      const { user: newUser, expiresIn: newExpiresIn } = await refreshTokenFn()
      setUser(newUser, newExpiresIn)
      lastRefreshAt.current = Date.now()
      retryAttempts.current = 0
    } catch (error) {
      const status = getErrorStatus(error)
      const isAuthFailure = status === 400 || status === 401 || status === 403
      if (isAuthFailure) {
        retryAttempts.current = 0
        onExpiredRef.current?.()
        return
      }

      if (retryAttempts.current < MAX_NETWORK_RETRIES) {
        const retryDelay =
          BASE_RETRY_DELAY_MS * 2 ** retryAttempts.current + Math.floor(Math.random() * 500)
        retryAttempts.current += 1
        clearTimer()
        timerRef.current = setTimeout(() => {
          void doRefresh()
        }, retryDelay)
        return
      }

      retryAttempts.current = 0
      onExpiredRef.current?.()
    } finally {
      refreshInProgress.current = false
    }
  }, [setUser, clearTimer])

  const scheduleRefresh = useCallback(
    (ttlSeconds: number) => {
      clearTimer()
      if (ttlSeconds <= 0) {
        void doRefresh()
        return
      }
      const delay = ttlSeconds * 0.75 * 1000
      timerRef.current = setTimeout(() => {
        void doRefresh()
      }, delay)
    },
    [clearTimer, doRefresh],
  )

  useEffect(() => {
    if (!isHydrated) return
    if (hasInitialized.current) return
    hasInitialized.current = true

    if (expiresIn != null && expiresIn > 0) {
      scheduleRefresh(expiresIn)
      return
    }

    if (typeof window !== 'undefined' && expiresIn == null) {
      const storedExpiresAt = getStoredExpiresAt()
      if (storedExpiresAt) {
        const expiresInFromStorage = Math.floor(
          (storedExpiresAt - Date.now()) / 1000,
        )
        if (expiresInFromStorage > 0) {
          scheduleRefresh(expiresInFromStorage)
        } else {
          void doRefresh()
        }
      }
    }
  }, [isHydrated, expiresIn, scheduleRefresh, doRefresh])

  useEffect(() => {
    if (expiresIn == null || expiresIn <= 0) return
    scheduleRefresh(expiresIn)
    return () => clearTimer()
  }, [expiresIn, scheduleRefresh, clearTimer])

  useEffect(() => {
    if (expiresIn == null) return

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return
      const currentExpiresIn = useAuthStore.getState().expiresIn
      if (currentExpiresIn == null || currentExpiresIn <= 0) {
        void doRefresh()
        return
      }
      scheduleRefresh(currentExpiresIn)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [expiresIn, scheduleRefresh, doRefresh])

  return { refresh: doRefresh }
}
