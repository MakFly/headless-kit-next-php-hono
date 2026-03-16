import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/support/$ticketId')({
  component: TicketDetailPage,
})

function TicketDetailPage() {
  const { ticketId } = Route.useParams()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ticket #{ticketId}</h2>
        <p className="text-muted-foreground">
          Conversation details.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Ticket #{ticketId}
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Ticket detail page will show the conversation thread with real-time messaging, status updates, and rating.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
