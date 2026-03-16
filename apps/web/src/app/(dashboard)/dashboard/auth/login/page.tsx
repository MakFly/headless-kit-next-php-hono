"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleIcon, GitHubIcon } from "@/components/auth/oauth-icons"
import { TestAccountsSelect } from "@/components/auth/test-accounts-select"
import { useLoginForm } from "@/components/auth/hooks/use-login-form"

function OrSeparator() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <hr className="flex-1 border-border" />
      <span>or</span>
      <hr className="flex-1 border-border" />
    </div>
  )
}

export default function DashboardLoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    testAccounts,
    handleSubmit,
    handleMagicLink,
    handleSelectTestAccount,
    handleOAuth,
    clearError,
  } = useLoginForm({
    redirectPath: "/dashboard",
    toasts: {
      success: { title: "Welcome back!", description: "You have been successfully logged in." },
      error: { title: "Login failed", description: "Please check your credentials and try again." },
      magicLinkSuccess: { title: "Magic link sent", description: "Check your inbox and open the login link." },
      magicLinkError: { title: "Magic link failed", description: "Magic link is unavailable for this backend." },
      emailRequired: { title: "Email required", description: "Enter your email first to receive a magic link." },
    },
  })

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

      {testAccounts.length > 0 && (
        <>
          <TestAccountsSelect accounts={testAccounts} onSelect={handleSelectTestAccount} />
          <OrSeparator />
        </>
      )}

      <div className="flex flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => handleOAuth("google")}
        >
          <GoogleIcon /> Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full"
          onClick={() => handleOAuth("github")}
        >
          <GitHubIcon /> Continue with GitHub
        </Button>
      </div>

      <OrSeparator />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { clearError(); setEmail(e.target.value) }}
            required
            disabled={isSubmitting}
            autoComplete="email"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => { clearError(); setPassword(e.target.value) }}
            required
            disabled={isSubmitting}
            autoComplete="current-password"
            className="h-11"
          />
          <Link
            href="/dashboard/auth/forgot-password"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleMagicLink}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in with magic link instead
        </button>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/dashboard/auth/register"
          className="text-primary underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
