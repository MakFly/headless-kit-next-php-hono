'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { PlanCard } from '@/components/saas/plan-card';
import { InvoicesDataTable } from '@/components/saas/invoices-data-table';
import { WithQuery } from '@/lib/query';
import { useInvoices } from '@/lib/query/saas';
import {
  getSubscriptionAction,
  getPlansAction,
  subscribeAction,
  cancelSubscriptionAction,
} from '@/lib/actions/saas/billing';
import { useOrgStore } from '@/stores/org-store';
import type { Subscription, Plan, SubscriptionStatus } from '@/types/saas';

const subStatusVariant: Record<SubscriptionStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  cancelled: 'destructive',
  past_due: 'destructive',
  trialing: 'secondary',
};

function InvoicesSection({ orgId }: { orgId: string }) {
  const { data } = useInvoices(orgId);
  return <InvoicesDataTable invoices={data ?? []} />;
}

export default function BillingPage() {
  const { activeOrg } = useOrgStore();
  const orgId = activeOrg?.id ?? '';
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!orgId) return;
    setIsLoading(true);
    try {
      const [sub, pl] = await Promise.all([
        getSubscriptionAction(orgId),
        getPlansAction(),
      ]);
      setSubscription(sub);
      setPlans(pl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const handleSubscribe = async (planId: string) => {
    if (!orgId) return;
    setActionLoading(true);
    try {
      const sub = await subscribeAction(orgId, planId);
      setSubscription(sub);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!orgId) return;
    setActionLoading(true);
    try {
      await cancelSubscriptionAction(orgId);
      setSubscription(null);
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Billing" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Billing" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error && (
          <Card>
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        {subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium">{subscription.plan?.name ?? 'Unknown'} Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} -{' '}
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={subStatusVariant[subscription.status]}>
                    {subscription.status}
                  </Badge>
                  {subscription.status === 'active' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" disabled={actionLoading}>
                          Cancel
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Cancel subscription?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Your subscription will remain active until the end of the current billing period.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                          <AlertDialogAction onClick={handleCancel}>
                            Cancel Subscription
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Plans</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentPlanId={subscription?.planId}
                onSubscribe={handleSubscribe}
                isLoading={actionLoading}
              />
            ))}
          </div>
        </div>

        {orgId && (
          <WithQuery>
            <InvoicesSection orgId={orgId} />
          </WithQuery>
        )}
      </div>
    </>
  );
}
