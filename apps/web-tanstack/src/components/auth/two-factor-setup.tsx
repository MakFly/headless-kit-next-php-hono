'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { enable2faFn, setup2faFn } from '@/lib/server/two-factor'

type Step = 'idle' | 'setup' | 'verify' | 'done'

type SetupData = {
  secret: string
  qrCode: string
  backupCodes: Array<string>
}

type Props = {
  onComplete?: (backupCodes: Array<string>) => void
  onCancel?: () => void
}

function isDataUri(value: string): boolean {
  return value.startsWith('data:')
}

export function TwoFactorSetup({ onComplete, onCancel }: Props) {
  const [step, setStep] = useState<Step>('idle')
  const [setupData, setSetupData] = useState<SetupData | null>(null)
  const [backupCodes, setBackupCodes] = useState<Array<string>>([])
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSetup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await setup2faFn()
      setSetupData(data)
      setStep('setup')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start 2FA setup')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setIsLoading(true)
    setError(null)
    try {
      const result = await enable2faFn({ data: { code } })
      setBackupCodes(result.backupCodes)
      setStep('done')
      onComplete?.(result.backupCodes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'idle') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Two-factor authentication adds an extra layer of security to your account.
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="bg-[var(--neon)] text-black hover:bg-[var(--neon)]/90"
          >
            {isLoading ? 'Setting up...' : 'Enable 2FA'}
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    )
  }

  if (step === 'setup' && setupData) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">1. Scan this QR code with your authenticator app</p>
          <div className="flex justify-center">
            {isDataUri(setupData.qrCode) ? (
              <Image
                src={setupData.qrCode}
                alt="2FA QR Code"
                width={200}
                height={200}
                className="rounded-md border"
              />
            ) : (
              <div className="rounded-md border bg-muted p-4 text-xs font-mono break-all max-w-xs">
                {setupData.qrCode || setupData.secret}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Or enter this key manually:{' '}
            <span className="font-mono font-medium text-foreground">{setupData.secret}</span>
          </p>
        </div>

        <form onSubmit={handleEnable} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="totp-code">2. Enter the 6-digit code from your app</Label>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              autoComplete="one-time-code"
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className="bg-[var(--neon)] text-black hover:bg-[var(--neon)]/90"
            >
              {isLoading ? 'Verifying...' : 'Verify & Enable'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setStep('idle'); setSetupData(null); setCode('') }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            Two-factor authentication is now enabled!
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">Save your backup codes</p>
          <p className="text-xs text-muted-foreground">
            These codes can be used to access your account if you lose your authenticator device.
            Each code can only be used once.
          </p>
          <div className="rounded-md border bg-muted p-3 font-mono text-xs grid grid-cols-2 gap-1">
            {backupCodes.map((c) => (
              <span key={c} className="text-foreground">{c}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return null
}

type TwoFactorSetupCardProps = Props

export function TwoFactorSetupCard({ onComplete, onCancel }: TwoFactorSetupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Up Two-Factor Authentication</CardTitle>
        <CardDescription>
          Protect your account with an authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorSetup onComplete={onComplete} onCancel={onCancel} />
      </CardContent>
    </Card>
  )
}
