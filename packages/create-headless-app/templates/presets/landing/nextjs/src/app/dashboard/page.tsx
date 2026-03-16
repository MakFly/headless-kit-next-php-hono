'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { ShieldIcon, LogOutIcon, MailIcon, UserIcon } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[var(--background-deep)]">
      <nav className="border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <ShieldIcon className="size-6 text-[var(--neon)]" />
            <span className="font-mono text-lg font-bold tracking-tight">RBAC Panel</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOutIcon className="mr-2 size-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-8">
          <h1 className="font-mono text-3xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-2 text-muted-foreground">
            You are signed in and ready to go.
          </p>
        </div>

        <Card className="border-[var(--neon-muted)]/20">
          <CardHeader>
            <CardTitle className="font-mono">Your Profile</CardTitle>
            <CardDescription>Account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <UserIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">Name</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MailIcon className="size-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Email</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
