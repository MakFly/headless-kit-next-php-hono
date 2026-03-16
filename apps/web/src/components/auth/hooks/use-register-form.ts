"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Route } from "next"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/auth-store"
import type { OAuthProvider } from "@/types"

type RegisterToasts = {
  success?: { title: string; description: string }
  error?: { title: string; description: string }
}

const defaultRegisterToasts: Required<RegisterToasts> = {
  success: { title: "Account created!", description: "Welcome aboard." },
  error: { title: "Registration failed", description: "Please try again." },
}

type UseRegisterFormParams = {
  redirectPath: string
  toasts?: RegisterToasts
}

type UseRegisterFormReturn = {
  name: string
  setName: (name: string) => void
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  passwordConfirmation: string
  setPasswordConfirmation: (passwordConfirmation: string) => void
  error: string
  submitting: boolean
  handleSubmit: (e: React.FormEvent) => Promise<void>
  fillDemo: () => void
  handleOAuth: (provider: OAuthProvider) => Promise<void>
}

export function useRegisterForm({ redirectPath, toasts: customToasts }: UseRegisterFormParams): UseRegisterFormReturn {
  const router = useRouter()
  const { register, loginWithOAuth } = useAuthStore()
  const t = { ...defaultRegisterToasts, ...customToasts }
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== passwordConfirmation) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setSubmitting(true)

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      toast.success(t.success.title, { description: t.success.description })
      router.push(redirectPath as Route)
    } catch (err) {
      const message = err instanceof Error ? err.message : t.error.description
      setError(message)
      toast.error(t.error.title, { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = () => {
    const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank"]
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones"]
    const first = firstNames[Math.floor(Math.random() * firstNames.length)]
    const last = lastNames[Math.floor(Math.random() * lastNames.length)]
    const pw = "Admin1234!"
    setName(`${first} ${last}`)
    setEmail(`${first.toLowerCase()}.${last.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`)
    setPassword(pw)
    setPasswordConfirmation(pw)
  }

  const handleOAuth = async (provider: OAuthProvider) => {
    await loginWithOAuth(provider)
  }

  return {
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
  }
}
