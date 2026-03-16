import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { useEffect, useCallback } from 'react'

import appCss from '../styles.css?url'
import { getCurrentUserFn } from '@/lib/server/auth'
import { useAuthStore } from '@/stores/auth-store'
import { useTokenRefresh } from '@/components/auth/use-token-refresh'
import type { RouterContext } from '@/types/router'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: '{{PROJECT_NAME}}' },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),

  beforeLoad: async () => {
    try {
      const result = await getCurrentUserFn()
      if (!result) return { user: null, expiresIn: null }
      return { user: result.user, expiresIn: result.expiresIn }
    } catch {
      return { user: null, expiresIn: null }
    }
  },

  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFound,
})

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
    </div>
  )
}

function RootComponent() {
  const context = Route.useRouteContext()
  const hydrate = useAuthStore((s) => s.hydrate)

  const handleExpired = useCallback(() => {
    hydrate(null, null)
  }, [hydrate])

  useTokenRefresh({ onExpired: handleExpired })

  useEffect(() => {
    hydrate(context.user, context.expiresIn)
  }, [context.user, context.expiresIn, hydrate])

  return <Outlet />
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="font-sans bg-background text-foreground">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
