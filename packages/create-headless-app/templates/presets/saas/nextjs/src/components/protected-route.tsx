'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth-store';
import { Skeleton } from '@/components/ui/skeleton';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string;
};

/**
 * Client-side route guard.
 * Redirects to login if not authenticated.
 * Optionally checks for a specific role.
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isHydrated } = useAuthStore();

  useEffect(() => {
    if (isHydrated && !user) {
      router.replace('/auth/login');
    }
    if (isHydrated && user && requiredRole) {
      const hasRole = user.roles.some((r) => r.slug === requiredRole);
      if (!hasRole) {
        router.replace('/dashboard');
      }
    }
  }, [isHydrated, user, requiredRole, router]);

  if (!isHydrated) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole && !user.roles.some((r) => r.slug === requiredRole)) {
    return null;
  }

  return <>{children}</>;
}
