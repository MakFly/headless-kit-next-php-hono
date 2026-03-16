import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SupportSidebar } from '@/components/support/support-sidebar';
import { getCurrentUserAction } from '@/lib/actions/auth';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';

type SupportLayoutProps = {
  children: React.ReactNode;
};

export default async function SupportLayout({ children }: SupportLayoutProps) {
  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);
  const authToken = cookieStore.get(cookieNames.accessToken);

  if (!authToken?.value) {
    redirect('/support/auth/login');
  }

  const initialUser = await getCurrentUserAction();

  return (
    <SidebarProvider>
      <SupportSidebar initialUser={initialUser} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
