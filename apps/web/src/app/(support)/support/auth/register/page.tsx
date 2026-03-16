"use client"

import Link from "next/link"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleIcon, GitHubIcon } from "@/components/auth/oauth-icons"
import { useRegisterForm } from "@/components/auth/hooks/use-register-form"

function OrSeparator() {
  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground">
      <hr className="flex-1 border-border" />
      <span>or</span>
      <hr className="flex-1 border-border" />
    </div>
  )
}

export default function SupportRegisterPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordConfirmation,
    setPasswordConfirmation,
    error,
    submitting,
    handleSubmit,
    fillDemo,
    handleOAuth,
  } = useRegisterForm({
    redirectPath: "/support",
    toasts: {
      success: { title: "Account created", description: "You can now access the Support Center." },
      error: { title: "Registration failed", description: "Could not create your account." },
    },
  })

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Get started with Support Center
        </p>
      </div>

      {process.env.NODE_ENV === "development" && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-1.5"
            onClick={fillDemo}
          >
            <Sparkles className="size-3.5" />
            Auto-fill with random data
          </Button>
          <OrSeparator />
        </>
      )}

      <div className="flex flex-col gap-2">
        <Button type="button" variant="outline" className="h-11 w-full" onClick={() => handleOAuth("google")}>
          <GoogleIcon />
          Continue with Google
        </Button>
        <Button type="button" variant="outline" className="h-11 w-full" onClick={() => handleOAuth("github")}>
          <GitHubIcon />
          Continue with GitHub
        </Button>
      </div>

      <OrSeparator />

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{error}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
            autoComplete="name"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
            autoComplete="email"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            autoComplete="new-password"
            minLength={8}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirmation">Confirm password</Label>
          <PasswordInput
            id="password_confirmation"
            placeholder="••••••••"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            disabled={submitting}
            autoComplete="new-password"
            minLength={8}
            className="h-11"
          />
        </div>

        <Button type="submit" className="h-11 w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/support/auth/login" className="text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
