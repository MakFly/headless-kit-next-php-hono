import { createFileRoute } from '@tanstack/react-router'
import { DashboardContent } from '@/components/dashboard/dashboard-content'

export const Route = createFileRoute('/dashboard/permissions')({
  component: PermissionsPage,
})

function PermissionsPage() {
  const { user } = Route.useRouteContext()
  if (!user) return null
  return <DashboardContent user={user} />
}
