'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Shield, ShieldCheck, Copy, Check, QrCode, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { setup2faAction, enable2faAction } from '@/lib/actions/auth/two-factor';
import type { TwoFactorSetupData } from '@/lib/actions/auth/two-factor';

type SetupStep = 'idle' | 'setup' | 'verify' | 'enabled';

type TwoFactorSetupProps = {
  onEnabled?: (backupCodes: string[]) => void;
};

export function TwoFactorSetup({ onEnabled }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('idle');
  const [setupData, setSetupData] = useState<TwoFactorSetupData | null>(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackupCodes, setCopiedBackupCodes] = useState(false);

  const handleStartSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await setup2faAction();
      setSetupData(result.data);
      setStep('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize 2FA setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      setError('Please enter a 6-digit code');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await enable2faAction(code);
      setBackupCodes(result.data.backupCodes);
      setStep('enabled');
      onEnabled?.(result.data.backupCodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySecret = async () => {
    if (!setupData?.secret) return;
    await navigator.clipboard.writeText(setupData.secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
  };

  const handleCopyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopiedBackupCodes(true);
    setTimeout(() => setCopiedBackupCodes(false), 2000);
  };

  const isQrCodeUri = setupData?.qrCode?.startsWith('otpauth://');
  const isBase64Image = setupData?.qrCode?.startsWith('data:image');

  if (step === 'enabled') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-green-600">
          <ShieldCheck className="h-5 w-5" />
          <span className="font-medium">Two-factor authentication enabled</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Save these backup codes in a secure location. Each code can only be used once.
        </p>
        <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
          {backupCodes.map((code, i) => (
            <p key={i} className="font-mono text-sm">
              {code}
            </p>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyBackupCodes}
          className="w-full"
        >
          {copiedBackupCodes ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy backup codes
            </>
          )}
        </Button>
      </div>
    );
  }

  if (step === 'setup' && setupData) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </p>
        </div>

        <div className="flex justify-center">
          {isBase64Image ? (
            <Image
              src={setupData.qrCode}
              alt="2FA QR Code"
              width={192}
              height={192}
              className="rounded-lg border"
            />
          ) : isQrCodeUri ? (
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-muted/50">
              <QrCode className="h-12 w-12 text-muted-foreground" />
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                QR code not available. Use the secret key below.
              </p>
            </div>
          ) : (
            <Image
              src={setupData.qrCode}
              alt="2FA QR Code"
              width={192}
              height={192}
              className="rounded-lg border"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Secret key (manual entry)</Label>
          <div className="flex gap-2">
            <Input
              value={setupData.secret}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopySecret}
              title="Copy secret"
            >
              {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="totp-code">Verification code</Label>
            <Input
              id="totp-code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setError(null);
                setCode(e.target.value.replace(/\D/g, ''));
              }}
              disabled={isLoading}
              className="font-mono text-center text-lg tracking-widest"
              autoComplete="one-time-code"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep('idle');
                setSetupData(null);
                setCode('');
                setError(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || code.length < 6} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Enable 2FA'
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Shield className="h-5 w-5" />
        <span className="text-sm">Two-factor authentication adds an extra layer of security to your account.</span>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button onClick={handleStartSetup} disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Set up 2FA
          </>
        )}
      </Button>
    </div>
  );
}

type TwoFactorSetupCardProps = {
  onEnabled?: (backupCodes: string[]) => void;
};

export function TwoFactorSetupCard({ onEnabled }: TwoFactorSetupCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Secure your account with an authenticator app
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TwoFactorSetup onEnabled={onEnabled} />
      </CardContent>
    </Card>
  );
}
