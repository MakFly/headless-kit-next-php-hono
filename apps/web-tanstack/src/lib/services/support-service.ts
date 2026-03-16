import { createServerFn } from '@tanstack/react-start'
import type {
  AgentQueue,
  CannedResponse,
  Conversation,
  ConversationStatus,
  ConversationWithMessages,
  CreateConversation,
  CsatRatings,
} from '@/types/support'
import { getAdapterConfig, getAuthAdapter, getBackendType } from '@/lib/adapters'

function getApiBaseUrl(): string {
  const backend = getBackendType()
  const config = getAdapterConfig(backend)
  const fallback = process.env.LARAVEL_API_URL || 'http://localhost:8000'
  return (config.baseUrl || fallback).replace(/\/$/, '')
}

async function fetchFromApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const adapter = getAuthAdapter()
  const baseUrl = getApiBaseUrl()

  const executeRequest = async (accessToken: string | null): Promise<Response> =>
    fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...options.headers,
      },
    })

  let token = await adapter.getAccessToken()
  let response = await executeRequest(token)

  if (response.status === 401) {
    try {
      const refreshed = await adapter.refresh()
      token = refreshed.tokens.access_token
      response = await executeRequest(token)
    } catch {
      await adapter.clearTokens()
    }
  }

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`)
  }

  const json = await response.json()

  if (json && typeof json === 'object' && 'success' in json) {
    return json.data as T
  }

  return json.data as T
}

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------

export const getConversationsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Conversation>> => {
    try {
      return await fetchFromApi<Array<Conversation>>('/api/v1/support/conversations')
    } catch (error) {
      console.error('[Support Service] Failed to fetch conversations:', error)
      return []
    }
  },
)

export const getConversationFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<ConversationWithMessages | null> => {
    try {
      return await fetchFromApi<ConversationWithMessages>(
        `/api/v1/support/conversations/${data.id}`,
      )
    } catch (error) {
      console.error('[Support Service] Failed to fetch conversation:', error)
      return null
    }
  })

export const createConversationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateConversation) => data)
  .handler(async ({ data }): Promise<Conversation> => {
    return await fetchFromApi<Conversation>('/api/v1/support/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

export const sendMessageFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { conversationId: string; content: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(
      `/api/v1/support/conversations/${data.conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content: data.content }),
      },
    )
  })

export const rateConversationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { conversationId: string; rating: number }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(
      `/api/v1/support/conversations/${data.conversationId}/rate`,
      {
        method: 'POST',
        body: JSON.stringify({ rating: data.rating }),
      },
    )
  })

// ---------------------------------------------------------------------------
// Agent Queue
// ---------------------------------------------------------------------------

export const getAgentQueueFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AgentQueue> => {
    try {
      const [unassigned, assigned] = await Promise.all([
        fetchFromApi<Array<Conversation>>('/api/v1/support/agent/queue'),
        fetchFromApi<Array<Conversation>>('/api/v1/support/agent/assigned'),
      ])
      return {
        unassigned: Array.isArray(unassigned) ? unassigned : [],
        assigned: Array.isArray(assigned) ? assigned : [],
        totalOpen:
          (Array.isArray(unassigned) ? unassigned.length : 0) +
          (Array.isArray(assigned) ? assigned.length : 0),
      }
    } catch (error) {
      console.error('[Support Service] Failed to fetch agent queue:', error)
      return { unassigned: [], assigned: [], totalOpen: 0 }
    }
  },
)

export const assignConversationFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { conversationId: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(
      `/api/v1/support/agent/conversations/${data.conversationId}/assign`,
      { method: 'PATCH' },
    )
  })

export const updateConversationStatusFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { conversationId: string; status: ConversationStatus }) => data,
  )
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(
      `/api/v1/support/agent/conversations/${data.conversationId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: data.status }),
      },
    )
  })

// ---------------------------------------------------------------------------
// Canned Responses
// ---------------------------------------------------------------------------

export const getCannedResponsesFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<CannedResponse>> => {
    try {
      return await fetchFromApi<Array<CannedResponse>>('/api/v1/support/agent/canned')
    } catch (error) {
      console.error('[Support Service] Failed to fetch canned responses:', error)
      return []
    }
  },
)

export const createCannedResponseFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      title: string
      content: string
      category?: string
      shortcut?: string
    }) => data,
  )
  .handler(async ({ data }): Promise<CannedResponse> => {
    return await fetchFromApi<CannedResponse>('/api/v1/support/agent/canned', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

export const updateCannedResponseFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      id: string
      title: string
      content: string
      category?: string
      shortcut?: string
    }) => data,
  )
  .handler(async ({ data }): Promise<CannedResponse> => {
    const { id, ...body } = data
    return await fetchFromApi<CannedResponse>(
      `/api/v1/support/agent/canned/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(body),
      },
    )
  })

export const deleteCannedResponseFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(`/api/v1/support/agent/canned/${data.id}`, {
      method: 'DELETE',
    })
  })

export const getRatingsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<CsatRatings> => {
    return await fetchFromApi<CsatRatings>('/api/v1/support/agent/ratings')
  },
)
