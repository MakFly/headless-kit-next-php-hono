"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { verifyResetTokenAction, resetPasswordAction } from "@/lib/actions/auth/actions"

export default function ShopResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setIsTokenValid(false)
      return
    }

    verifyResetTokenAction(token).then((result) => {
      setIsTokenValid(result.data.valid)
      if (result.data.email) {
        setEmail(result.data.email)
      }
      setIsVerifying(false)
    })
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 8) {
      toast.error("Password too short", {
        description: "Password must be at least 8 characters.",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match", {
        description: "Please make sure both passwords are identical.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      await resetPasswordAction(token, newPassword)
      setIsSuccess(true)
      toast.success("Password reset", {
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      toast.error("Reset failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center space-y-6 py-8">
        <Loader2 className="size-7 animate-spin text-stone-400" />
        <p className="text-xs tracking-wide text-stone-500">Verifying your reset link…</p>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-0">
        <div className="mb-10 space-y-2 text-center">
          <h1 className="font-serif text-2xl text-stone-900">Invalid Link</h1>
          <p className="text-xs tracking-wide text-stone-500">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="space-y-6">
          <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center space-y-6 py-4 duration-500">
            <div className="flex size-16 items-center justify-center border border-stone-200 bg-stone-50">
              <AlertCircle className="size-7 text-stone-600" />
            </div>
            <p className="max-w-xs text-center text-xs tracking-wide text-stone-500">
              The link may have expired or already been used. Request a new reset link.
            </p>
            <Button
              asChild
              className="h-11 w-full rounded-none bg-stone-900 hover:bg-stone-800 text-[11px] uppercase tracking-[0.15em] font-normal"
            >
              <Link href="/shop/auth/forgot-password">Request new link</Link>
            </Button>
          </div>

          <div className="flex justify-center">
            <Link
              href="/shop/auth/login"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="size-3" />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 space-y-2 text-center">
        <h1 className="font-serif text-2xl text-stone-900">
          {isSuccess ? "Password Updated" : "Set New Password"}
        </h1>
        <p className="text-xs tracking-wide text-stone-500">
          {isSuccess
            ? "Your password has been reset successfully."
            : email
              ? `Choose a new password for ${email}.`
              : "Choose a new password for your account."}
        </p>
      </div>

      <div className="space-y-6">
        {isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center space-y-6 py-4 duration-500">
            <div className="flex size-16 items-center justify-center border border-stone-200 bg-stone-50">
              <CheckCircle2 className="size-7 text-stone-600" />
            </div>
            <p className="max-w-xs text-center text-xs tracking-wide text-stone-500">
              You can now sign in with your new password.
            </p>
            <Button
              asChild
              className="h-11 w-full rounded-none bg-stone-900 hover:bg-stone-800 text-[11px] uppercase tracking-[0.15em] font-normal"
            >
              <Link href="/shop/auth/login">Sign in</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="new-password"
                className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  autoFocus
                  disabled={isSubmitting}
                  autoComplete="new-password"
                  className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="text-[11px] tracking-[0.15em] uppercase text-stone-600"
              >
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
                autoComplete="new-password"
                className="h-11 rounded-none border-stone-300 focus-visible:ring-stone-400 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-none bg-stone-900 hover:bg-stone-800 text-[11px] uppercase tracking-[0.15em] font-normal"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}

        {!isSuccess && (
          <div className="flex justify-center">
            <Link
              href="/shop/auth/login"
              className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-stone-500 hover:text-stone-900 transition-colors"
            >
              <ArrowLeft className="size-3" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
