"use client"

import Link from "next/link"
import { Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/auth/password-input"
import { GoogleIcon, GitHubIcon } from "@/components/auth/oauth-icons"
import { OrDivider } from "@/components/auth/or-divider"
import { useRegisterForm } from "@/components/auth/hooks/use-register-form"

export default function ShopRegisterPage() {
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
    redirectPath: "/shop",
    toasts: {
      success: { title: "Welcome to Maison", description: "Your account has been created." },
      error: { title: "Registration failed", description: "Please try again." },
    },
  })

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 space-y-2 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Create Account</h1>
        <p className="text-xs tracking-wide text-stone-500">
          Join Maison and discover our collections.
        </p>
      </div>

      {/* Dev helper */}
      <div className="mb-6 flex justify-center">
        <button
          type="button"
          onClick={fillDemo}
          className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-400 hover:text-stone-700 transition-colors"
        >
          <Sparkles className="size-3" />
          Fill demo data
        </button>
      </div>

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
            htmlFor="name"
            className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
          >
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitting}
            autoComplete="name"
            className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
          />
        </div>

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
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
            autoComplete="email"
            className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
          >
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="Min. 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
            autoComplete="new-password"
            className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password-confirmation"
            className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
          >
            Confirm Password
          </Label>
          <PasswordInput
            id="password-confirmation"
            placeholder="Repeat your password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            disabled={submitting}
            autoComplete="new-password"
            className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="mt-2 h-11 w-full rounded-none bg-stone-900 hover:bg-stone-800 text-[11px] uppercase tracking-[0.15em] font-normal"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-10 text-center text-[11px] tracking-wide uppercase text-stone-500">
        Already have an account?{" "}
        <Link
          href="/shop/auth/login"
          className="text-stone-900 hover:underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}
