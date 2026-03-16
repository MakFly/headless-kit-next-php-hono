import { createFileRoute } from '@tanstack/react-router'
import { BarChart3Icon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/saas/usage')({
  component: UsagePage,
})

function UsagePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usage</h2>
        <p className="text-muted-foreground">
          Monitor your resource usage and limits.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3Icon className="size-5" />
            Usage Metrics
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Usage page will display API calls, storage, member count, and project usage with progress bars against plan limits.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
