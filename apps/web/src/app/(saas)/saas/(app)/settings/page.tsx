'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { OrgRbacGuard } from '@/components/saas/org-rbac-guard';
import { getSettingsAction, updateSettingsAction } from '@/lib/actions/saas/usage';
import { useOrgStore } from '@/stores/org-store';
import type { SaasSettings } from '@/types/saas';

export default function SettingsPage() {
  const { activeOrg } = useOrgStore();
  const orgId = activeOrg?.id ?? '';
  const [settings, setSettings] = useState<SaasSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  useEffect(() => {
    if (!orgId) return;
    const load = async () => {
      try {
        const data = await getSettingsAction(orgId);
        setSettings(data);
        setName(data.organizationName);
        setSlug(data.slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [orgId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgId) return;
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const updated = await updateSettingsAction(orgId, { name, slug });
      setSettings(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Settings" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-64 w-full max-w-lg" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Settings" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error && (
          <Card className="max-w-lg">
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <OrgRbacGuard
          minRole="admin"
          fallback={
            <Card className="max-w-lg">
              <CardContent className="p-6 text-center text-muted-foreground">
                You need admin permissions to manage organization settings.
              </CardContent>
            </Card>
          }
        >
          <Card className="max-w-lg">
            <form onSubmit={handleSave}>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My Organization"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-slug">Slug</Label>
                  <Input
                    id="org-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="my-organization"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs. Lowercase letters, numbers, and hyphens only.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center gap-3">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                {success && (
                  <span className="text-sm text-green-600 dark:text-green-500">
                    Saved successfully
                  </span>
                )}
              </CardFooter>
            </form>
          </Card>
        </OrgRbacGuard>
      </div>
    </>
  );
}
