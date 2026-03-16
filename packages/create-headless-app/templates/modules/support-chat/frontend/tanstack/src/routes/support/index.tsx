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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            View and manage your support conversations below.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
