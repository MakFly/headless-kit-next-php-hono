import { createFileRoute } from '@tanstack/react-router'
import { getConversationFn, sendMessageFn } from '@/lib/services/support-service'
import { ConversationThread } from '@/components/support/conversation-thread'

export const Route = createFileRoute('/support/c/$id')({
  loader: async ({ params }) => {
    const conversation = await getConversationFn({ data: { id: params.id } })
    return { conversation }
  },
  component: ConversationPage,
})

function ConversationPage() {
  const { conversation } = Route.useLoaderData()

  if (!conversation) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    )
  }

  const handleSendMessage = async (content: string) => {
    await sendMessageFn({ data: { conversationId: conversation.id, content } })
  }

  return <ConversationThread conversation={conversation} onSendMessage={handleSendMessage} />
}
