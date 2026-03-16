import { createFileRoute, redirect } from '@tanstack/react-router'
import { UsersTable } from '@/components/dashboard/users-table'
import { getUsersFn, getRolesFn } from '@/lib/services/rbac-service'
import { UsersPageSkeleton } from '@/components/ui/skeletons'

export const Route = createFileRoute('/dashboard/users')({
  beforeLoad: ({ context }) => {
    const isAdmin = context.user?.roles?.some((r) => r.slug === 'admin')
    if (!isAdmin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  loader: async () => {
    const [users, roles] = await Promise.all([getUsersFn(), getRolesFn()])
    return { users, roles }
  },
  component: UsersPage,
  pendingComponent: UsersPageSkeleton,
})

function UsersPage() {
  const { users, roles } = Route.useLoaderData()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">Manage user accounts and roles.</p>
      </div>
      <UsersTable users={users} roles={roles} />
    </div>
  )
}
