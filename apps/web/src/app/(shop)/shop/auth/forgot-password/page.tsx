"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ShopForgotPasswordPage() {
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
        description:
          "If an account exists with that email, you will receive a reset link.",
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
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-10 space-y-2 text-center">
        <h1 className="font-serif text-2xl text-stone-900">
          {isSuccess ? "Check Your Inbox" : "Forgot Password"}
        </h1>
        <p className="text-xs tracking-wide text-stone-500">
          {isSuccess
            ? "We sent a password reset link to your email address."
            : "Enter your email and we\u2019ll send you a reset link."}
        </p>
      </div>

      <div className="space-y-6">
        {isSuccess ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-col items-center space-y-6 py-4 duration-500">
            <div className="flex size-16 items-center justify-center border border-stone-200 bg-stone-50">
              <CheckCircle2 className="size-7 text-stone-600" />
            </div>
            <p className="max-w-xs text-center text-xs tracking-wide text-stone-500">
              If an account exists for{" "}
              <span className="font-medium text-stone-900">{email}</span>, you
              will receive a password reset email shortly.
            </p>
            <Button
              variant="outline"
              className="h-11 w-full rounded-none border-stone-300 text-[11px] uppercase tracking-[0.15em] font-normal hover:bg-stone-50"
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
                autoFocus
                disabled={isSubmitting}
                autoComplete="email"
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
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}

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
