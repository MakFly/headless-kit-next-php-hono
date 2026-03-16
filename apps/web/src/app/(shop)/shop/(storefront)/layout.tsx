import { cookies } from 'next/headers';
import { ShopNavbar } from '@/components/shop/shop-navbar';
import { ShopFooter } from '@/components/shop/shop-footer';
import { getCurrentUserAction } from '@/lib/actions/auth';
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context';

type StorefrontLayoutProps = {
  children: React.ReactNode;
};

export default async function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const cookieStore = await cookies();
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value);
  const cookieNames = getCookieNamesForBackend(backend);
  const authToken = cookieStore.get(cookieNames.accessToken);

  let initialUser = null;
  if (authToken?.value) {
    try {
      initialUser = await getCurrentUserAction();
    } catch {
      // User not authenticated — that's fine for public shop pages
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <ShopNavbar initialUser={initialUser} />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </div>
  );
}
