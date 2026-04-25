"use client"

import { Suspense, useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { storeOAuthTokensAction } from "@/lib/actions/auth/store-oauth-tokens"
import { useAuthStore } from "@/stores/auth-store"

function OAuthCallbackInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setUser } = useAuthStore()
  const handled = useRef(false)

  useEffect(() => {
    // Prevent double execution in React strict mode
    if (handled.current) return
    handled.current = true

    const accessToken = searchParams.get("access_token")
    const refreshToken = searchParams.get("refresh_token")
    const expiresIn = searchParams.get("expires_in")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      router.replace(
        `/dashboard/auth/login?error=${encodeURIComponent(errorParam)}`
      )
      return
    }

    if (!accessToken) {
      router.replace("/dashboard/auth/login?error=missing_tokens")
      return
    }

    storeOAuthTokensAction({
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: expiresIn ? parseInt(expiresIn, 10) : null,
    }).then((result) => {
      if (result.success) {
        setUser(result.user)
        router.replace("/dashboard")
      } else {
        router.replace(
          `/dashboard/auth/login?error=${encodeURIComponent(result.error)}`
        )
      }
    })
  }, [searchParams, router, setUser])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Completing sign in…</p>
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OAuthCallbackInner />
    </Suspense>
  )
}
