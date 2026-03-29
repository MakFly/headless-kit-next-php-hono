import { getAdapterConfig, getAuthAdapter, getBackendType } from '@/lib/adapters'

export function getApiBaseUrl(): string {
  const backend = getBackendType()
  const config = getAdapterConfig(backend)
  const fallback = process.env.LARAVEL_API_URL || 'http://localhost:8002'
  return (config.baseUrl || fallback).replace(/\/$/, '')
}

export async function fetchFromApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const adapter = getAuthAdapter()
  const baseUrl = getApiBaseUrl()

  const executeRequest = async (accessToken: string | null): Promise<Response> =>
    fetch(`${baseUrl}${path}`, {
      ...options,
      signal: AbortSignal.timeout(30_000),
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
      await response.body?.cancel().catch(() => {})
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
    // For paginated responses, reconstruct { data, pagination } shape from meta
    if (Array.isArray(json.data) && json.meta) {
      return { data: json.data, pagination: json.meta } as T
    }
    return json.data as T
  }

  return json.data as T
}
