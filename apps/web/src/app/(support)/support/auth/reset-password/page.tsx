"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeftIcon, CheckCircle2Icon, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { verifyResetTokenAction, resetPasswordAction } from "@/lib/actions/auth/actions"

export default function SupportResetPasswordPage() {
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
      <div className="flex flex-col items-center space-y-4 py-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying your reset link…</p>
      </div>
    )
  }

  if (!isTokenValid) {
    return (
      <div className="space-y-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">Invalid link</h1>
          <p className="text-sm text-muted-foreground">
            This password reset link is invalid or has expired.
          </p>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center space-y-4 py-4 duration-500">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/30">
            <AlertCircle className="size-8 text-red-600" />
          </div>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            The link may have expired or already been used. Request a new reset link.
          </p>
          <Button asChild className="mt-2 h-11 w-full">
            <Link href="/support/auth/forgot-password">Request new link</Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <Link
            href="/support/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSuccess ? "Password updated" : "Set new password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSuccess
            ? "Your password has been reset successfully."
            : email
              ? `Choose a new password for ${email}.`
              : "Choose a new password for your account."}
        </p>
      </div>

      {isSuccess ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center space-y-4 py-4 duration-500">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
            <CheckCircle2Icon className="size-8 text-green-600" />
          </div>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            You can now sign in with your new password.
          </p>
          <Button asChild className="mt-2 h-11 w-full">
            <Link href="/support/auth/login">Sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
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
                className="h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm password</Label>
            <Input
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              className="h-11"
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating password…
              </>
            ) : (
              "Reset password"
            )}
          </Button>
        </form>
      )}

      {!isSuccess && (
        <div className="flex justify-center">
          <Link
            href="/support/auth/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeftIcon className="size-4" />
            Back to login
          </Link>
        </div>
      )}
    </div>
  )
}
