import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { getCurrentUserAction } from '@/lib/actions/auth';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

/**
 * Layout SSR pour le dashboard
 *
 * - Vérifie l'authentification côté serveur (cookie check par backend)
 * - Redirige vers /dashboard/auth/login si non connecté
 * - Fetch le user côté serveur et le passe à AppSidebar pour éviter le flash
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);
  const authToken = cookieStore.get(cookieNames.accessToken);

  if (!authToken?.value) {
    redirect('/dashboard/auth/login');
  }

  const initialUser = await getCurrentUserAction();

  return (
    <SidebarProvider>
      <AppSidebar initialUser={initialUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
