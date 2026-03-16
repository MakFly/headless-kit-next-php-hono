import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquareTextIcon } from 'lucide-react'

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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create, edit, and organize template responses with shortcuts and categories.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
