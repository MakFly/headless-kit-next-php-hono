import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/shop/admin-sidebar';
import { getCurrentUserAction } from '@/lib/actions/auth';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';
import type { User } from '@/types';
import { isAdmin as checkIsAdmin } from '@/types';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);
  const authToken = cookieStore.get(cookieNames.accessToken);

  if (!authToken?.value) {
    redirect('/shop');
  }

  let user: User | null = null;
  try {
    user = await getCurrentUserAction();
  } catch {
    redirect('/shop');
  }

  if (!user || !checkIsAdmin(user)) {
    redirect('/shop');
  }

  return (
    <SidebarProvider>
      <AdminSidebar initialUser={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
