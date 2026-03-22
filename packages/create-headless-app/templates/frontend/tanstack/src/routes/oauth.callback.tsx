import { useEffect, useRef } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { storeOAuthTokensFn } from '@/lib/server/store-oauth-tokens'
import { useAuthStore } from '@/stores/auth-store'

type OAuthCallbackSearch = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  error?: string
}

export const Route = createFileRoute('/oauth/callback')({
  validateSearch: (search: Record<string, unknown>): OAuthCallbackSearch => ({
    access_token: typeof search.access_token === 'string' ? search.access_token : undefined,
    refresh_token: typeof search.refresh_token === 'string' ? search.refresh_token : undefined,
    expires_in: typeof search.expires_in === 'string' ? parseInt(search.expires_in, 10) : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  component: OAuthCallbackPage,
})

function OAuthCallbackPage() {
  const search = Route.useSearch()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const handled = useRef(false)

  useEffect(() => {
    // Prevent double execution in React strict mode
    if (handled.current) return
    handled.current = true

    const redirectToLogin = (errorMsg: string) => {
      window.location.replace(`/login?error=${encodeURIComponent(errorMsg)}`)
    }

    if (search.error) {
      redirectToLogin(search.error)
      return
    }

    if (!search.access_token) {
      redirectToLogin('missing_tokens')
      return
    }

    storeOAuthTokensFn({
      data: {
        access_token: search.access_token,
        refresh_token: search.refresh_token ?? null,
        expires_in: search.expires_in ?? null,
      },
    }).then((result) => {
      if (result.success) {
        setUser(result.user)
        navigate({ to: '/dashboard', replace: true })
      } else {
        redirectToLogin(result.error)
      }
    })
  }, [search, navigate, setUser])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  )
}
