'use server'

import { bffPost } from '../_shared/bff-client'
import type { Conversation } from '@/types/support'

type EscalateInput = {
  subject: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  priority?: 'low' | 'medium' | 'high' | 'urgent'
}

export async function escalateToHumanAction(input: EscalateInput): Promise<Conversation> {
  // Build the initial message from AI chat history
  const historyText = input.messages
    .map((m) => `[${m.role === 'user' ? 'User' : 'AI'}]: ${m.content}`)
    .join('\n\n')

  const message = `--- Escalated from AI Chat ---\n\n${historyText}`

  const response = await bffPost<Conversation | { data: Conversation }>(
    '/api/v1/support/conversations',
    {
      subject: input.subject,
      message,
      priority: input.priority || 'medium',
    }
  )

  // Handle both direct and wrapped responses
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as { data: Conversation }).data
  }
  return response as Conversation
}
