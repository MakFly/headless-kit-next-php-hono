import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { getCurrentUserAction } from '@/lib/actions/auth';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

/**
 * Dashboard layout with server-side auth check and sidebar
 */
export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken?.value) {
    redirect('/auth/login');
  }

  const initialUser = await getCurrentUserAction();

  return (
    <SidebarProvider>
      <AppSidebar initialUser={initialUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
