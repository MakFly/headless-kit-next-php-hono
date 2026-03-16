import { ZustandHydration } from './zustand-hydration';
import { getCurrentUserAction } from '@/lib/actions/auth';
import type { User } from '@/types';

type AuthInitializerProps = {
  children: React.ReactNode;
};

/**
 * Server Component that initializes auth with SSR
 *
 * Fetches the user server-side and hydrates the Zustand store
 * to avoid client-side fetch on mount.
 */
export async function AuthInitializer({ children }: AuthInitializerProps) {
  let user: User | null = null;

  try {
    user = await getCurrentUserAction();
  } catch {
    user = null;
  }

  return (
    <>
      <ZustandHydration user={user} />
      {children}
    </>
  );
}
