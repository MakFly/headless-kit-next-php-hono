import { createFileRoute } from '@tanstack/react-router'
import { MessageSquareTextIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/support/agent/canned')({
  component: CannedResponsesPage,
})

function CannedResponsesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Canned Responses</h2>
        <p className="text-muted-foreground">
          Manage pre-written response templates.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquareTextIcon className="size-5" />
            Canned Responses
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Canned responses page will allow creating, editing, and organizing template responses with shortcuts and categories.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
