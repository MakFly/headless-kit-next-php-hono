'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MetricCard } from '@/components/saas/metric-card';
import { getSaasDashboardAction } from '@/lib/actions/saas/dashboard';
import { useOrgStore } from '@/stores/org-store';
import { UsersIcon, FolderIcon, ZapIcon, HardDriveIcon } from 'lucide-react';
import Link from 'next/link';
import type { SaasDashboard } from '@/types/saas';

export default function SaasDashboardPage() {
  const { activeOrg } = useOrgStore();
  const [dashboard, setDashboard] = useState<SaasDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrg) return;
    setIsLoading(true);
    setError(null);
    getSaasDashboardAction(activeOrg.id)
      .then(setDashboard)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load dashboard'))
      .finally(() => setIsLoading(false));
  }, [activeOrg?.id]);

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Dashboard" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error ? (
          <Card>
            <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
          </Card>
        ) : dashboard ? (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">Overview</h2>
                {dashboard.currentPlan && (
                  <Badge variant="secondary">{dashboard.currentPlan.name} Plan</Badge>
                )}
              </div>
              {dashboard.currentPlan?.slug === 'free' && (
                <Link href="/saas/billing">
                  <Button>Upgrade Plan</Button>
                </Link>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard title="Active Members" value={dashboard.activeMembers} icon={UsersIcon} />
              <MetricCard title="Projects" value={dashboard.totalProjects} icon={FolderIcon} />
              <MetricCard
                title="API Calls (This Month)"
                value={dashboard.apiCallsThisMonth.toLocaleString()}
                icon={ZapIcon}
              />
              <MetricCard
                title="Storage Used"
                value={`${dashboard.storageUsed} MB`}
                icon={HardDriveIcon}
              />
            </div>

            {dashboard.recentActivity?.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {dashboard.recentActivity.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                      >
                        <div>
                          <span className="font-medium">{entry.actor}</span>{' '}
                          <span className="text-muted-foreground">{entry.action}</span>{' '}
                          <span className="font-medium">{entry.target}</span>
                        </div>
                        <span className="text-muted-foreground text-xs">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : null}
      </div>
    </>
  );
}
