import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InboxIcon } from 'lucide-react'

export const Route = createFileRoute('/support/agent/')({
  component: AgentQueuePage,
})

function AgentQueuePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agent Queue</h2>
        <p className="text-muted-foreground">
          Manage support tickets as an agent.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InboxIcon className="size-5" />
            Queue
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Agent queue will show unassigned and assigned conversations with priority sorting and quick assignment actions.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
