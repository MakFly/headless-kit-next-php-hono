import { createFileRoute } from '@tanstack/react-router'
import { UsersIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/saas/team')({
  component: TeamPage,
})

function TeamPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Team</h2>
        <p className="text-muted-foreground">
          Manage team members and invitations.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="size-5" />
            Team Members
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Team page will display members, roles, pending invitations, and member management controls.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
