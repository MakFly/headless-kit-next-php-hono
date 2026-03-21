'use client'

import { useState } from 'react'
import { useRouter } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth-store'

export function TwoFactorVerify() {
  const [code, setCode] = useState('')
  const [useRecovery, setUseRecovery] = useState(false)
  const { verify2fa, verify2faRecovery, isLoading, error, clearError } = useAuthStore()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()
    try {
      if (useRecovery) {
        await verify2faRecovery(code)
      } else {
        await verify2fa(code)
      }
      router.navigate({ to: '/dashboard' })
    } catch {}
  }

  const toggleMode = () => {
    setCode('')
    clearError()
    setUseRecovery((v) => !v)
  }

  return (
    <Card className="w-full max-w-md border-[var(--neon-muted)]/20">
      <CardHeader className="text-center">
        <CardTitle className="font-mono text-2xl">Two-Factor Authentication</CardTitle>
        <CardDescription>
          {useRecovery
            ? 'Enter one of your backup recovery codes.'
            : 'Enter the 6-digit code from your authenticator app.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code">{useRecovery ? 'Recovery Code' : 'Authentication Code'}</Label>
            <Input
              id="code"
              type="text"
              placeholder={useRecovery ? 'xxxxxxxx-xxxx' : '000000'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={useRecovery ? 20 : 6}
              autoComplete="one-time-code"
              inputMode={useRecovery ? 'text' : 'numeric'}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[var(--neon)] text-black hover:bg-[var(--neon)]/90"
            disabled={isLoading || code.length === 0}
          >
            {isLoading ? 'Verifying...' : 'Verify'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleMode}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            {useRecovery ? 'Use authenticator app instead' : 'Use a backup code instead'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
