import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { GrainOverlay } from '@/components/landing/grain-overlay'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[var(--background-deep,var(--background))] p-4">
      <GrainOverlay />
      <Outlet />
    </div>
  )
}
