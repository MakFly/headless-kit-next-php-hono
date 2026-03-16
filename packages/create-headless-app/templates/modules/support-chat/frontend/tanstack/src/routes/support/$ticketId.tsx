import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
          <CardTitle>Ticket #{ticketId}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Conversation thread with real-time messaging, status updates, and rating.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
