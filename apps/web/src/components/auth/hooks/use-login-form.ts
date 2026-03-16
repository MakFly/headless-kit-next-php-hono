"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Route } from "next"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import type { OAuthProvider } from "@/types"

type TestAccount = {
  email: string
  name: string
  password: string
  role: string
  type?: string
}

type LoginToasts = {
  success?: { title: string; description: string }
  error?: { title: string; description: string }
  magicLinkSuccess?: { title: string; description: string }
  magicLinkError?: { title: string; description: string }
  emailRequired?: { title: string; description: string }
}

const defaultToasts: Required<LoginToasts> = {
  success: { title: "Welcome back!", description: "You have been successfully logged in." },
  error: { title: "Login failed", description: "Please check your credentials and try again." },
  magicLinkSuccess: { title: "Magic link sent", description: "Check your inbox and open the login link." },
  magicLinkError: { title: "Magic link failed", description: "Magic link is unavailable for this backend." },
  emailRequired: { title: "Email required", description: "Enter your email first to receive a magic link." },
}

type UseLoginFormParams = {
  redirectPath: string
  toasts?: LoginToasts
}

type UseLoginFormReturn = {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  error: string | null
  isSubmitting: boolean
  testAccounts: TestAccount[]
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleMagicLink: () => Promise<void>
  handleSelectTestAccount: (account: TestAccount) => void
  handleOAuth: (provider: OAuthProvider) => Promise<void>
  clearError: () => void
}

export function useLoginForm({ redirectPath, toasts: customToasts }: UseLoginFormParams): UseLoginFormReturn {
  const router = useRouter()
  const { login, loginWithOAuth, loginWithMagicLink, error, clearError } = useAuthStore()
  const t = { ...defaultToasts, ...customToasts }
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testAccounts, setTestAccounts] = useState<TestAccount[]>([])

  useEffect(() => {
    fetch("/api/v1/auth/test-accounts")
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setTestAccounts(json.data ?? []))
      .catch(() => setTestAccounts([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    setIsSubmitting(true)

    try {
      await login({ email, password })
      toast.success(t.success.title, { description: t.success.description })
      router.push(redirectPath as Route)
    } catch {
      toast.error(t.error.title, { description: error || t.error.description })
      setIsSubmitting(false)
    }
  }

  const handleMagicLink = async () => {
    clearError()
    if (!email) {
      toast.error(t.emailRequired.title, { description: t.emailRequired.description })
      return
    }

    try {
      await loginWithMagicLink(email)
      toast.success(t.magicLinkSuccess.title, { description: t.magicLinkSuccess.description })
    } catch {
      toast.error(t.magicLinkError.title, { description: error || t.magicLinkError.description })
    }
  }

  const handleSelectTestAccount = (account: TestAccount) => {
    setEmail(account.email)
    if (account.password) setPassword(account.password)
    clearError()
  }

  const handleOAuth = async (provider: OAuthProvider) => {
    await loginWithOAuth(provider)
  }

  return {
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
  }
}
