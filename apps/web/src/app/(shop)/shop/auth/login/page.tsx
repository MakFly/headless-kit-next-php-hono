"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleIcon, GitHubIcon } from "@/components/auth/oauth-icons"
import { OrDivider } from "@/components/auth/or-divider"
import { TestAccountsSelect } from "@/components/auth/test-accounts-select"
import { useLoginForm } from "@/components/auth/hooks/use-login-form"

export default function ShopLoginPage() {
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
    redirectPath: "/shop",
    toasts: {
      success: { title: "Welcome to Maison", description: "You are now signed in." },
      error: { title: "Sign in failed", description: "Please verify your credentials." },
      magicLinkSuccess: { title: "Link sent", description: "Check your inbox for your sign-in link." },
      magicLinkError: { title: "Link unavailable", description: "Magic link is not available for this store." },
      emailRequired: { title: "Email needed", description: "Please enter your email address first." },
    },
  })

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 space-y-2 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Sign In</h1>
        <p className="text-xs tracking-wide text-stone-500">
          Enter your credentials to continue.
        </p>
      </div>

      {/* Test accounts */}
      <TestAccountsSelect
        accounts={testAccounts}
        onSelect={handleSelectTestAccount}
        className="[&_.text-muted-foreground]:text-stone-500 [&_button]:h-11 [&_button]:rounded-none [&_button]:border-stone-300 [&_button]:bg-stone-50"
      />

      {/* OAuth */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-none border-stone-300 text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-50"
          onClick={() => handleOAuth("google")}
        >
          <GoogleIcon />
          <span className="ml-2">Continue with Google</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-none border-stone-300 text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-50"
          onClick={() => handleOAuth("github")}
        >
          <GitHubIcon />
          <span className="ml-2">Continue with GitHub</span>
        </Button>
      </div>

      <OrDivider className="border-stone-200 text-stone-400" />

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="animate-in fade-in text-[13px] text-red-600 duration-200">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              clearError()
              setEmail(e.target.value)
            }}
            required
            disabled={isSubmitting}
            autoComplete="email"
            className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
            >
              Password
            </Label>
            <Link
              href="/shop/auth/forgot-password"
              className="text-[11px] tracking-wide text-stone-500 hover:text-stone-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              clearError()
              setPassword(e.target.value)
            }}
            required
            disabled={isSubmitting}
            autoComplete="current-password"
            className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 h-11 w-full rounded-none bg-stone-900 hover:bg-stone-800 text-[11px] uppercase tracking-[0.15em] font-normal"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Magic link */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={handleMagicLink}
          className="text-[11px] tracking-wide uppercase text-stone-500 hover:text-stone-900 transition-colors"
        >
          Sign in with magic link instead
        </button>
      </div>

      {/* Footer */}
      <p className="mt-10 text-center text-[11px] tracking-wide uppercase text-stone-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/shop/auth/register"
          className="text-stone-900 hover:underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  )
}
