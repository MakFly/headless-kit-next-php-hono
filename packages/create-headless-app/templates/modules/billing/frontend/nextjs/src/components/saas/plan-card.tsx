'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckIcon } from 'lucide-react';
import type { Plan } from '@/types/saas';

type PlanCardProps = {
  plan: Plan;
  currentPlanId?: string | null;
  onSubscribe: (planId: string) => void;
  isLoading?: boolean;
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function PlanCard({ plan, currentPlanId, onSubscribe, isLoading }: PlanCardProps) {
  const isCurrent = currentPlanId === plan.id;

  return (
    <Card className={isCurrent ? 'border-primary' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          {isCurrent && <Badge>Current</Badge>}
        </div>
        <CardDescription>
          <span className="text-2xl font-bold text-foreground">{formatPrice(plan.priceMonthly)}</span>
          <span className="text-muted-foreground">/month</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <CheckIcon className="h-4 w-4 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 text-xs text-muted-foreground">
          <p>Up to {plan.limits.maxMembers} members</p>
          <p>Up to {plan.limits.maxProjects} projects</p>
          <p>{plan.limits.apiCallsPerMonth.toLocaleString()} API calls/month</p>
          <p>{plan.limits.maxStorage} MB storage</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? 'outline' : 'default'}
          disabled={isCurrent || isLoading}
          onClick={() => onSubscribe(plan.id)}
        >
          {isCurrent ? 'Current Plan' : 'Subscribe'}
        </Button>
      </CardFooter>
    </Card>
  );
}
