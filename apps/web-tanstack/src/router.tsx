import { createRouter } from '@tanstack/react-router'
import { QueryClient, QueryCache } from '@tanstack/react-query'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { refreshTokenFn } from './lib/server/auth'
import { useAuthStore } from './stores/auth-store'
import type { RouterContext } from './types/router'

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: unknown) => {
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status
            if (status === 401 || status === 400) {
              return false
            }
          }
          return failureCount <= 1
        },
      },
      mutations: {
        retry: false,
      },
    },
    queryCache: new QueryCache({
      onError: async (error) => {
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status
          if (status === 401 || status === 400) {
            try {
              const { user, expiresIn } = await refreshTokenFn()
              useAuthStore.getState().setUser(user, expiresIn)
            } catch {
              useAuthStore.getState().setUser(null, null)
            }
          }
        }
      },
    }),
  })
}

export const getRouter = () => {
  const queryClient = createQueryClient()

  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    context: {
      user: null,
      queryClient,
    } satisfies RouterContext,
  })

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
    wrapQueryClient: false,
  })

  return router
}
