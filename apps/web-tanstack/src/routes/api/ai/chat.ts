import { createFileRoute } from '@tanstack/react-router'
import { streamText } from 'ai'
import { resolveModel } from '@/lib/ai/providers'
import { getAuthAdapter } from '@/lib/adapters'

export const Route = createFileRoute('/api/ai/chat')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Check auth
        const adapter = getAuthAdapter()
        const token = await adapter.getAccessToken()
        if (!token) {
          return new Response('Unauthorized', { status: 401 })
        }

        const { messages, provider, model } = await request.json()

        const result = streamText({
          model: resolveModel(provider, model),
          system: `You are a helpful support assistant for a SaaS platform.
Be concise, friendly, and solution-oriented.
If you cannot resolve the issue, suggest the user escalate to a human agent.
Never make up information about account details or billing.`,
          messages,
          maxOutputTokens: 1024,
        })

        return result.toUIMessageStreamResponse()
      },
    },
  },
})
