import { streamText } from 'ai'
import { resolveModel } from '@/lib/ai/providers'
import { cookies } from 'next/headers'
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  resolveBackend,
} from '@/lib/auth/backend-context'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  const backend = resolveBackend(cookieStore.get(AUTH_BACKEND_COOKIE)?.value)
  const cookieNames = getCookieNamesForBackend(backend)
  const authToken = cookieStore.get(cookieNames.accessToken)

  if (!authToken?.value) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, provider, model } = await req.json()

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
}

export const runtime = 'nodejs'
