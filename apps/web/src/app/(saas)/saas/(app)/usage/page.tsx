'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { getUsageAction } from '@/lib/actions/saas/usage';
import { useOrgStore } from '@/stores/org-store';
import type { UsageMetric, UsageRecord } from '@/types/saas';

const metricLabels: Record<UsageMetric, string> = {
  api_calls: 'API Calls',
  storage: 'Storage (MB)',
  members: 'Team Members',
  projects: 'Projects',
};

function getUsageColor(percentage: number): string {
  if (percentage >= 80) return 'text-destructive';
  if (percentage >= 60) return 'text-yellow-600 dark:text-yellow-500';
  return 'text-primary';
}

function getProgressColor(percentage: number): string {
  if (percentage >= 80) return '[&>div]:bg-destructive';
  if (percentage >= 60) return '[&>div]:bg-yellow-500';
  return '';
}

export default function UsagePage() {
  const { activeOrg } = useOrgStore();
  const orgId = activeOrg?.id ?? '';
  const [records, setRecords] = useState<UsageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    setIsLoading(true);
    setError(null);
    getUsageAction(orgId)
      .then(setRecords)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load usage data'))
      .finally(() => setIsLoading(false));
  }, [orgId]);

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Usage" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Usage" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error ? (
          <Card>
            <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
          </Card>
        ) : records.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record) => {
              const percentage = record.limit > 0 ? Math.round((record.value / record.limit) * 100) : 0;
              return (
                <Card key={record.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metricLabels[record.metric] ?? record.metric}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl font-bold ${getUsageColor(percentage)}`}>
                        {record.value.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        / {record.limit.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={Math.min(percentage, 100)}
                      className={getProgressColor(percentage)}
                    />
                    <p className="text-xs text-muted-foreground text-right">{percentage}% used</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No usage data available
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
