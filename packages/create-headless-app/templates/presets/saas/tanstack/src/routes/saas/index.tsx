import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LayoutDashboardIcon } from 'lucide-react'

export const Route = createFileRoute('/saas/')({
  component: SaasDashboardPage,
})

function SaasDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">SaaS Dashboard</h2>
        <p className="text-muted-foreground">
          Manage your organization and subscription.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboardIcon className="size-5" />
            Dashboard
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            SaaS dashboard will display active members, projects, API usage, storage metrics, and recent activity.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
