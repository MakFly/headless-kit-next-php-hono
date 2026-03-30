import { useState, useEffect } from "react"
import { getMessages, type Locale } from "@/i18n"

export function AuthNavButtons({ locale = "en", productionMode = false }: { locale?: Locale; productionMode?: boolean }) {
  const t = getMessages(locale)
  const [user, setUser] = useState<{ name: string; email: string; role?: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (productionMode) {
      setLoading(false)
      return
    }
    fetch("/api/auth/get-session", { credentials: "include" })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        setUser(data?.user ?? null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [productionMode])

  if (loading) {
    return (
      <div className="hidden h-8 w-20 animate-pulse rounded-full bg-muted sm:block" />
    )
  }

  if (productionMode) {
    return null
  }

  if (user) {
    return (
      <>
        <a
          href="/dashboard"
          className="hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-block"
        >
          {t.nav.dashboard}
        </a>
        <a
          href="/auth/logout"
          className="hidden rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
        >
          {t.nav.logout}
        </a>
      </>
    )
  }

  return (
    <>
      <a
        href="/auth/login"
        className="hidden rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
      >
        {t.nav.signIn}
      </a>
      <a
        href="/auth/register"
        className="hidden rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-block"
      >
        {t.nav.getStarted}
      </a>
    </>
  )
}
