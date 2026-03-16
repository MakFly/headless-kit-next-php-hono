'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ShieldIcon, MailIcon, LockIcon, ArrowRightIcon, LoaderIcon } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [testAccounts, setTestAccounts] = useState<{ email: string; name: string; password: string; role: string }[]>([])

  useEffect(() => {
    fetch('/api/v1/auth/test-accounts')
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
      toast.success('Welcome back!', {
        description: 'You have been successfully logged in.',
      })
      router.push('/dashboard')
    } catch {
      toast.error('Login failed', {
        description: error || 'Please check your credentials and try again.',
      })
      setIsSubmitting(false)
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError()
    setEmail(e.target.value)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    clearError()
    setPassword(e.target.value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background-deep)] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />

      <Card className="w-full max-w-md relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--neon)] via-[var(--neon-muted)] to-[var(--neon)]" />

        <CardHeader className="space-y-2 pb-6 pt-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-[var(--neon)]/10 border border-[var(--neon)]/20 flex items-center justify-center shadow-[0_0_24px_var(--neon-glow)]">
              <ShieldIcon className="h-8 w-8 text-[var(--neon)]" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-900/20 border border-red-800 text-red-300 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={handleEmailChange}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={handlePasswordChange}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-11 bg-[var(--neon)] text-black font-semibold hover:bg-[var(--neon)]/90 hover:shadow-[0_0_24px_var(--neon-glow)] group"
            >
              {isSubmitting ? (
                <>
                  <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-8">
          {testAccounts.length > 0 && (
            <div className="w-full space-y-2">
              <p className="text-xs text-muted-foreground">Quick test accounts</p>
              <div className="flex flex-wrap gap-2">
                {testAccounts.map((account) => (
                  <Button
                    key={account.email}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setEmail(account.email)
                      setPassword(account.password)
                    }}
                  >
                    {account.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <Separator />
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="text-[var(--neon)] hover:text-[var(--neon)]/80 font-medium">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
