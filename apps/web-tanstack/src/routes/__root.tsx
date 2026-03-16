import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useCallback, useEffect } from 'react'

import appCss from '../styles.css?url'
import type { RouterContext } from '@/types/router'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { getCurrentUserFn } from '@/lib/server/auth'
import { useAuthStore } from '@/stores/auth-store'
import { useTokenRefresh } from '@/components/auth/use-token-refresh'

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'RBAC Panel' },
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
      <h1 className="font-mono text-6xl font-bold text-[var(--neon)]">404</h1>
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('ui-theme');
                  var theme = stored || 'dark';
                  if (theme === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
          <Toaster />
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
