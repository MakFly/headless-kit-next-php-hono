import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/shop/admin')({
  beforeLoad: ({ context }) => {
    const isAdmin = context.user?.roles?.some((r) => r.slug === 'admin')
    if (!isAdmin) {
      throw redirect({ to: '/shop' })
    }
  },
  component: ShopAdminLayout,
})

function ShopAdminLayout() {
  return <Outlet />
}
