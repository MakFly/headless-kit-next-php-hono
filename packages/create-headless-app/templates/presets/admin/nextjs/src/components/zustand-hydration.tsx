'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import type { User } from '@/types';

type ZustandHydrationProps = {
  user: User | null;
};

/**
 * Client component to hydrate the Zustand store from SSR data.
 * Hydration only happens once on mount.
 */
export function ZustandHydration({ user }: ZustandHydrationProps) {
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      useAuthStore.getState().hydrate(user);
      hydrated.current = true;
    }
  }, [user]);

  return null;
}
