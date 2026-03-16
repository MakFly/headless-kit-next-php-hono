import { createFileRoute } from '@tanstack/react-router'
import { UserIcon, ShieldIcon, KeyIcon, CalendarIcon, ActivityIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { DashboardSkeleton } from '@/components/ui/skeletons'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardPage,
  pendingComponent: DashboardSkeleton,
})

function DashboardPage() {
  const user = useAuthStore((s) => s.user)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (!isHydrated) return <DashboardSkeleton />

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <UserIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.name ?? '-'}</div>
            <p className="text-xs text-muted-foreground">{user?.email ?? '-'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <ShieldIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.roles?.length ?? 0}</div>
            <div className="mt-1 flex flex-wrap gap-1">
              {user?.roles?.map((role) => (
                <Badge key={role.slug} variant="secondary" className="text-xs">
                  {role.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <KeyIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.permissions?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Age</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountAge}</div>
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Roles</CardTitle>
            <CardDescription>Assigned roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            {user?.roles?.length ? (
              <div className="space-y-3">
                {user.roles.map((role) => (
                  <div key={role.slug} className="flex items-center gap-3 rounded-lg border p-3">
                    <ShieldIcon className="size-5 text-[var(--neon)]" />
                    <div>
                      <p className="font-medium capitalize">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.slug}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No roles assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                <ActivityIcon className="size-5" />
                <p className="text-sm font-medium">View Activity Log</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
