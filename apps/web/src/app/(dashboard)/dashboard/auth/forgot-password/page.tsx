"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function DashboardForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/v1/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.message || "Something went wrong. Please try again.")
      }

      setIsSuccess(true)
      toast.success("Email sent", {
        description: "If an account exists with that email, you will receive a reset link.",
      })
    } catch (error) {
      toast.error("Request failed", {
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">
          {isSuccess ? "Check your inbox" : "Forgot password"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSuccess
            ? "We sent a password reset link to your email address."
            : "Enter your email and we'll send you a reset link."}
        </p>
      </div>

      {isSuccess ? (
        <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center space-y-4 py-4 duration-500">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30">
            <CheckCircle2 className="size-8 text-green-600" />
          </div>
          <p className="max-w-xs text-center text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>, you
            will receive a password reset email shortly.
          </p>
          <Button
            variant="outline"
            className="mt-2 h-11 w-full"
            onClick={() => {
              setIsSuccess(false)
              setEmail("")
            }}
          >
            Send another email
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              disabled={isSubmitting}
              autoComplete="email"
              className="h-11"
            />
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>
      )}

      <div className="flex justify-center">
        <Link
          href="/dashboard/auth/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to login
        </Link>
      </div>
    </div>
  )
}
