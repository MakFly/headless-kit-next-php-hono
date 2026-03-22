'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, ShieldOff, Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TwoFactorSetup } from './two-factor-setup';
import {
  get2faStatusAction,
  disable2faAction,
  getRecoveryCodesAction,
} from '@/lib/actions/auth/two-factor';

type View = 'status' | 'setup' | 'disable' | 'backup-codes';

export function TwoFactorSettings() {
  const [is2faEnabled, setIs2faEnabled] = useState<boolean | null>(null);
  const [view, setView] = useState<View>('status');
  const [disableCode, setDisableCode] = useState('');
  const [disableError, setDisableError] = useState<string | null>(null);
  const [isDisabling, setIsDisabling] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await get2faStatusAction();
      setIs2faEnabled(result.data.enabled);
    } catch {
      setStatusError('Unable to load 2FA status.');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disableCode) return;

    setIsDisabling(true);
    setDisableError(null);

    try {
      await disable2faAction(disableCode);
      setIs2faEnabled(false);
      setView('status');
      setDisableCode('');
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : 'Invalid code. Please try again.');
      setDisableCode('');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleViewBackupCodes = async () => {
    setIsLoadingCodes(true);
    try {
      const result = await getRecoveryCodesAction();
      setBackupCodes(result.data.codes);
      setView('backup-codes');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to load backup codes.');
    } finally {
      setIsLoadingCodes(false);
    }
  };

  const handleCopyBackupCodes = async () => {
    await navigator.clipboard.writeText(backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetupComplete = (codes: string[]) => {
    setIs2faEnabled(true);
    setBackupCodes(codes);
    setView('status');
  };

  if (is2faEnabled === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusError ? (
            <p className="text-sm text-destructive">{statusError}</p>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {is2faEnabled ? (
                <ShieldCheck className="h-5 w-5 text-green-600" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
              Two-Factor Authentication
            </CardTitle>
            <CardDescription>
              Add an extra layer of security to your account
            </CardDescription>
          </div>
          <Badge
            variant={is2faEnabled ? 'default' : 'secondary'}
            className={is2faEnabled ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
          >
            {is2faEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {view === 'status' && (
          <>
            {is2faEnabled ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your account is protected with two-factor authentication.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewBackupCodes}
                    disabled={isLoadingCodes}
                  >
                    {isLoadingCodes ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    View backup codes
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setView('disable')}
                  >
                    <ShieldOff className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication is not enabled. Enable it to add an extra layer of security.
                </p>
                <Button size="sm" onClick={() => setView('setup')}>
                  <Shield className="h-4 w-4 mr-2" />
                  Enable 2FA
                </Button>
              </div>
            )}
          </>
        )}

        {view === 'setup' && (
          <>
            <Separator />
            <TwoFactorSetup onEnabled={handleSetupComplete} />
          </>
        )}

        {view === 'disable' && (
          <>
            <Separator />
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app to disable two-factor authentication.
              </p>
              <form onSubmit={handleDisable} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="disable-code">Authentication code</Label>
                  <Input
                    id="disable-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={disableCode}
                    onChange={(e) => {
                      setDisableError(null);
                      setDisableCode(e.target.value.replace(/\D/g, ''));
                    }}
                    disabled={isDisabling}
                    className="font-mono text-center text-lg tracking-widest max-w-[200px]"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                {disableError && (
                  <p className="text-sm text-destructive">{disableError}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setView('status');
                      setDisableCode('');
                      setDisableError(null);
                    }}
                    disabled={isDisabling}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="destructive"
                    size="sm"
                    disabled={isDisabling || disableCode.length < 6}
                  >
                    {isDisabling ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Disabling...
                      </>
                    ) : (
                      'Disable 2FA'
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}

        {view === 'backup-codes' && (
          <>
            <Separator />
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Backup recovery codes</p>
                <p className="text-sm text-muted-foreground">
                  Each code can only be used once. Keep them in a safe place.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4 space-y-1">
                {backupCodes.map((code, i) => (
                  <p key={i} className="font-mono text-sm">
                    {code}
                  </p>
                ))}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyBackupCodes}
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy codes
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView('status')}
                >
                  Back
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
