import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircleIcon } from 'lucide-react'

export const Route = createFileRoute('/support/')({
  component: SupportIndexPage,
})

function SupportIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Support</h2>
        <p className="text-muted-foreground">
          Your conversations and support tickets.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleIcon className="size-5" />
            Conversations
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Support page will display a list of conversations with status indicators, priority badges, and the ability to create new tickets.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
