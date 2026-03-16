import { cn } from '@/lib/utils'
import type { Message } from '@/types/support'

type MessageBubbleProps = {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.senderType === 'user'
  const isSystem = message.senderType === 'system'

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col gap-1 max-w-[75%]', isUser ? 'ml-auto items-end' : 'mr-auto items-start')}>
      <span className="text-xs text-muted-foreground">
        {message.senderName ?? (isUser ? 'You' : 'Agent')}
      </span>
      <div
        className={cn(
          'rounded-lg px-4 py-2 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        {message.content}
      </div>
      <span className="text-xs text-muted-foreground">
        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  )
}
