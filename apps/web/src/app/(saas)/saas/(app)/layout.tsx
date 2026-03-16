import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SaasSidebar } from '@/components/saas/saas-sidebar';
import { getCurrentUserAction } from '@/lib/actions/auth';
import { listOrgsAction } from '@/lib/actions/saas/orgs';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';
import { OrgStoreHydrator } from './org-store-hydrator';

type SaasLayoutProps = {
  children: React.ReactNode;
};

export default async function SaasLayout({ children }: SaasLayoutProps) {
  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);
  const authToken = cookieStore.get(cookieNames.accessToken);

  if (!authToken?.value) {
    redirect('/saas/auth/login');
  }

  let initialUser = null;
  try {
    initialUser = await getCurrentUserAction();
  } catch {
    // Backend unreachable — still render with null user
  }

  let orgs: Awaited<ReturnType<typeof listOrgsAction>> = [];
  let orgsFetchFailed = false;
  try {
    orgs = await listOrgsAction();
  } catch {
    orgsFetchFailed = true;
  }

  // Only redirect to onboarding if we successfully fetched and got 0 orgs.
  // If the fetch failed (backend down), don't redirect — let the pages handle it.
  if (!orgsFetchFailed && orgs.length === 0) {
    redirect('/saas/onboarding');
  }

  return (
    <SidebarProvider>
      <OrgStoreHydrator orgs={orgs} />
      <SaasSidebar initialUser={initialUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
