import { createFileRoute } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
})

function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const logout = useAuthStore((s) => s.logout)

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const accountAge = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, {user?.name ?? 'User'}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Profile</h3>
          <div className="mt-2 text-2xl font-bold">{user?.name ?? '-'}</div>
          <p className="text-xs text-muted-foreground">{user?.email ?? '-'}</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Roles</h3>
          <div className="mt-2 text-2xl font-bold">{user?.roles?.length ?? 0}</div>
          <div className="mt-1 flex flex-wrap gap-1">
            {user?.roles?.map((role) => (
              <span
                key={role.slug}
                className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
              >
                {role.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Account Age</h3>
          <div className="mt-2 text-2xl font-bold">{accountAge}</div>
          <p className="text-xs text-muted-foreground">days</p>
        </div>
      </div>

      <div className="flex">
        <button
          onClick={() => logout()}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
