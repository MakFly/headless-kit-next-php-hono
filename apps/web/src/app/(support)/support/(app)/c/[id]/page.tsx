'use client'

import { useParams } from 'next/navigation'
import { AiChatThread } from '@/components/support/ai-chat-thread'

export default function AiChatThreadPage() {
  const { id } = useParams<{ id: string }>()

  return <AiChatThread threadId={id} />
}
