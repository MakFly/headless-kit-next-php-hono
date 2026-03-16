import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/support/agent')({
  beforeLoad: ({ context }) => {
    const isAdmin = context.user?.roles?.some((r: { slug: string }) => r.slug === 'admin')
    if (!isAdmin) {
      throw redirect({ to: '/support' })
    }
  },
  component: AgentLayout,
})

function AgentLayout() {
  return <Outlet />
}
