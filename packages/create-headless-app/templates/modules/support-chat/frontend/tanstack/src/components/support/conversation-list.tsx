import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Conversation, ConversationStatus, ConversationPriority } from '@/types/support'

type ConversationListProps = {
  conversations: Conversation[]
}

const statusVariant: Record<ConversationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'default',
  assigned: 'secondary',
  waiting: 'outline',
  resolved: 'secondary',
  closed: 'outline',
}

const priorityVariant: Record<ConversationPriority, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p>No conversations yet</p>
        <p className="text-sm">Create a new conversation to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <Link key={conversation.id} to="/support/$ticketId" params={{ ticketId: conversation.id }}>
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{conversation.subject}</p>
                <p className="text-sm text-muted-foreground">
                  {conversation.lastMessageAt
                    ? new Date(conversation.lastMessageAt).toLocaleDateString()
                    : new Date(conversation.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={priorityVariant[conversation.priority]}>
                  {conversation.priority}
                </Badge>
                <Badge variant={statusVariant[conversation.status]}>
                  {conversation.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
