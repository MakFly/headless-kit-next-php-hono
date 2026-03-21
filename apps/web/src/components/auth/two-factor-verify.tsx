'use client';

import { useState } from 'react';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { verify2faAction, verify2faRecoveryAction } from '@/lib/actions/auth/two-factor';
import type { TwoFactorAuthResponse } from '@/lib/actions/auth/two-factor';

type VerifyMode = 'totp' | 'recovery';

type TwoFactorVerifyProps = {
  onSuccess: (data: TwoFactorAuthResponse) => void;
  onCancel?: () => void;
};

export function TwoFactorVerify({ onSuccess, onCancel }: TwoFactorVerifyProps) {
  const [mode, setMode] = useState<VerifyMode>('totp');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setError(null);

    try {
      const result =
        mode === 'totp'
          ? await verify2faAction(code)
          : await verify2faRecoveryAction(code);
      onSuccess(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (newMode: VerifyMode) => {
    setMode(newMode);
    setCode('');
    setError(null);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Two-factor verification</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {mode === 'totp'
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter one of your backup recovery codes.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="2fa-code">
            {mode === 'totp' ? 'Authentication code' : 'Recovery code'}
          </Label>
          <Input
            id="2fa-code"
            type="text"
            inputMode={mode === 'totp' ? 'numeric' : 'text'}
            pattern={mode === 'totp' ? '[0-9]*' : undefined}
            maxLength={mode === 'totp' ? 6 : undefined}
            placeholder={mode === 'totp' ? '000000' : 'xxxxxxxx-xxxx'}
            value={code}
            onChange={(e) => {
              setError(null);
              const val = mode === 'totp'
                ? e.target.value.replace(/\D/g, '')
                : e.target.value;
              setCode(val);
            }}
            disabled={isLoading}
            className={mode === 'totp' ? 'font-mono text-center text-lg tracking-widest' : 'font-mono'}
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-sm text-destructive animate-in fade-in duration-200">{error}</p>
        )}

        <Button
          type="submit"
          className="h-11 w-full"
          disabled={isLoading || !code}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify'
          )}
        </Button>
      </form>

      <div className="space-y-2 text-center">
        {mode === 'totp' ? (
          <button
            type="button"
            onClick={() => switchMode('recovery')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use a backup code instead
          </button>
        ) : (
          <button
            type="button"
            onClick={() => switchMode('totp')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Use authenticator app instead
          </button>
        )}

        {onCancel && (
          <div>
            <button
              type="button"
              onClick={onCancel}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
