import { useState, useEffect } from "react"
import { signIn } from "@/lib/auth-client"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GoogleButton } from "./GoogleButton"
import { getMessages, type Locale } from "@/i18n"

export function LoginForm({ isDev = false, locale = "en" }: { isDev?: boolean; locale?: Locale }) {
  const t = getMessages(locale)

  const DEV_ACCOUNTS = [
    { label: t.auth.devAdmin, email: "admin@headlesskit.dev", password: "admin123!" },
    { label: t.auth.devCustomerPro, email: "customer@headlesskit.dev", password: "customer123!" },
    { label: t.auth.devCustomerBusiness, email: "business@headlesskit.dev", password: "business123!" },
  ]
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [redirect, setRedirect] = useState("/dashboard")

  useEffect(() => {
    setRedirect(new URLSearchParams(window.location.search).get("redirect") || "/dashboard")
  }, [])

  function fillAccount(account: (typeof DEV_ACCOUNTS)[number]) {
    setEmail(account.email)
    setPassword(account.password)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await signIn.email({ email, password })

      if (result.error) {
        toast.error(result.error.message || t.auth.invalidCredentials)
        setError(result.error.message || t.auth.invalidCredentials)
        setLoading(false)
        return
      }

      toast.success("Welcome back!")
      window.location.href = redirect
    } catch {
      toast.error(t.auth.unexpectedError)
      setError(t.auth.unexpectedError)
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t.auth.signIn}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t.auth.signInSubtitle}
        </p>
      </div>

      {/* Dev autofill */}
      {isDev && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="mb-2 text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {t.auth.devAutofill}
          </p>
          <div className="flex flex-wrap gap-2">
            {DEV_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillAccount(account)}
                className="rounded-md border border-amber-500/20 bg-card px-2.5 py-1 text-[11px] text-amber-600 dark:text-amber-400 transition-colors hover:border-amber-500/50 hover:bg-amber-500/10"
              >
                {account.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass-card">
        <div className="space-y-6 p-6">
          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {t.auth.email}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t.auth.emailPlaceholder}
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                {t.auth.password}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.auth.passwordPlaceholder}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? t.auth.signingIn : t.auth.signIn}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-card/80 px-2 text-muted-foreground">
                {t.auth.or}
              </span>
            </div>
          </div>

          <GoogleButton label={t.auth.continueWithGoogle} locale={locale} />

          <p className="text-center text-sm text-muted-foreground">
            {t.auth.noAccount}{" "}
            <a
              href="/auth/register"
              className="text-primary underline-offset-4 hover:underline"
            >
              {t.auth.createOne}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
