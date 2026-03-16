'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OnboardingForm } from '@/components/saas/onboarding-form';
import { useOrgStore } from '@/stores/org-store';

export default function OnboardingPage() {
  const { orgs } = useOrgStore();
  const hasExistingOrgs = orgs.length > 0;

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {hasExistingOrgs && (
          <Link
            href="/saas"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to dashboard
          </Link>
        )}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">
            {hasExistingOrgs ? 'New organization' : 'Create your organization'}
          </h1>
          <p className="text-muted-foreground">
            {hasExistingOrgs
              ? 'Add another organization to your account'
              : 'Set up your first organization to get started'}
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
