"use client"

import { Suspense, useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { KeyRoundIcon, ArrowLeftIcon, CheckCircle2Icon, AlertCircleIcon, Eye, EyeOff, Loader2 } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [isVerifying, setIsVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
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

    fetch(`/api/v1/auth/password/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        setIsTokenValid(data?.valid === true)
      })
      .catch(() => {
        setIsTokenValid(false)
      })
      .finally(() => {
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
      const response = await fetch("/api/v1/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: newPassword }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || "Something went wrong. Please try again.")
      }

      setIsSuccess(true)
      toast.success("Password reset", {
        description: "Your password has been updated successfully.",
      })
    } catch (error) {
      toast.error("Reset failed", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-violet-50/20 to-indigo-50/30 p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-violet-400/20 opacity-20 blur-[100px]" />

      <Card className="w-full max-w-md relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600" />

        <CardHeader className="space-y-2 pb-6 pt-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <KeyRoundIcon className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {isVerifying ? "Verifying link..." : isSuccess ? "Password updated" : "Set new password"}
          </CardTitle>
          <CardDescription className="text-center">
            {isVerifying
              ? "Please wait while we verify your reset link."
              : isSuccess
                ? "Your password has been reset successfully."
                : "Choose a strong password for your account."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {isVerifying ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !isTokenValid ? (
            <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center">
                <AlertCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                This password reset link is invalid or has expired. Request a new reset link.
              </p>
              <Button asChild className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                <Link href="/auth/forgot-password">Request new link</Link>
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="flex flex-col items-center space-y-4 py-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center">
                <CheckCircle2Icon className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                You can now sign in with your new password.
              </p>
              <Button asChild className="w-full mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white">
                <Link href="/auth/login">Sign in</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">New password</Label>
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">Confirm password</Label>
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

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/25"
              >
                {isSubmitting ? (
                  <>
                    <Spinner className="mr-2" />
                    Updating password...
                  </>
                ) : (
                  "Reset password"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        {!isVerifying && !isSuccess && isTokenValid && (
          <CardFooter className="flex justify-center pb-8">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-violet-600 hover:text-violet-700 font-medium transition-colors"
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  )
}
