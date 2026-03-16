'use client'

import { AiChatThread } from '@/components/support/ai-chat-thread'
import { MessageBubble } from '@/components/support/message-bubble'
import { ChatInput } from '@/components/support/chat-input'
import type { ConversationWithMessages } from '@/types/support'

type ConversationThreadProps = {
  conversation: ConversationWithMessages
  onSendMessage: (content: string) => Promise<void>
}

export function ConversationThread({ conversation, onSendMessage }: ConversationThreadProps) {
  // AI mode: no agent assigned and status is open
  const isAiMode = !conversation.agentId && conversation.status === 'open'

  if (isAiMode) {
    return <AiChatThread />
  }

  // Human mode: show existing messages + chat input
  const canSendMessage = conversation.status !== 'closed'

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {conversation.messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
      </div>
      {canSendMessage ? (
        <ChatInput onSend={onSendMessage} />
      ) : (
        <div className="border-t p-4 text-center text-sm text-muted-foreground">
          This conversation is closed
        </div>
      )}
    </div>
  )
}
