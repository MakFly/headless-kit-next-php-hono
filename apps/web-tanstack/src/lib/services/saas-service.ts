import { createServerFn } from '@tanstack/react-start'
import type {
  CreateOrgData,
  Invoice,
  OrgMembership,
  Plan,
  SaasDashboard,
  SaasSettings,
  Subscription,
  TeamMember,
  TeamRole,
  UsageRecord,
} from '@/types/saas'
import { getAdapterConfig, getAuthAdapter, getBackendType } from '@/lib/adapters'

function getApiBaseUrl(): string {
  const backend = getBackendType()
  const config = getAdapterConfig(backend)
  const fallback = process.env.LARAVEL_API_URL || 'http://localhost:8002'
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
// Organizations
// ---------------------------------------------------------------------------

export const listOrgsFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<OrgMembership>> => {
    try {
      return await fetchFromApi<Array<OrgMembership>>('/api/v1/saas/orgs')
    } catch (error) {
      console.error('[SaaS Service] Failed to list orgs:', error)
      return []
    }
  },
)

export const createOrgFn = createServerFn({ method: 'POST' })
  .inputValidator((data: CreateOrgData) => data)
  .handler(async ({ data }): Promise<OrgMembership> => {
    return await fetchFromApi<OrgMembership>('/api/v1/saas/orgs', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  })

export const getOrgFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<OrgMembership> => {
    return await fetchFromApi<OrgMembership>(`/api/v1/saas/orgs/${data.orgId}`)
  })

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------

export const getSaasDashboardFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<SaasDashboard> => {
    return await fetchFromApi<SaasDashboard>(
      `/api/v1/saas/orgs/${data.orgId}/dashboard`,
    )
  })

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export const getSubscriptionFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<Subscription | null> => {
    try {
      return await fetchFromApi<Subscription>(
        `/api/v1/saas/orgs/${data.orgId}/subscription`,
      )
    } catch {
      return null
    }
  })

export const subscribeFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { orgId: string; planId: string }) => data)
  .handler(async ({ data }): Promise<Subscription> => {
    return await fetchFromApi<Subscription>(
      `/api/v1/saas/orgs/${data.orgId}/subscription`,
      {
        method: 'POST',
        body: JSON.stringify({ planId: data.planId }),
      },
    )
  })

export const cancelSubscriptionFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(`/api/v1/saas/orgs/${data.orgId}/subscription`, {
      method: 'DELETE',
    })
  })

export const getInvoicesFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<Array<Invoice>> => {
    return await fetchFromApi<Array<Invoice>>(
      `/api/v1/saas/orgs/${data.orgId}/invoices`,
    )
  })

export const getPlansFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Plan>> => {
    try {
      return await fetchFromApi<Array<Plan>>('/api/v1/saas/plans')
    } catch (error) {
      console.error('[SaaS Service] Failed to fetch plans:', error)
      return []
    }
  },
)

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

export const getTeamMembersFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<Array<TeamMember>> => {
    return await fetchFromApi<Array<TeamMember>>(
      `/api/v1/saas/orgs/${data.orgId}/team`,
    )
  })

export const inviteTeamMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { orgId: string; email: string; role: TeamRole }) => data)
  .handler(async ({ data }): Promise<TeamMember> => {
    return await fetchFromApi<TeamMember>(
      `/api/v1/saas/orgs/${data.orgId}/team/invite`,
      {
        method: 'POST',
        body: JSON.stringify({ email: data.email, role: data.role }),
      },
    )
  })

export const changeTeamMemberRoleFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { orgId: string; memberId: string; role: TeamRole }) => data,
  )
  .handler(async ({ data }): Promise<TeamMember> => {
    return await fetchFromApi<TeamMember>(
      `/api/v1/saas/orgs/${data.orgId}/team/${data.memberId}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify({ role: data.role }),
      },
    )
  })

export const removeTeamMemberFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { orgId: string; memberId: string }) => data)
  .handler(async ({ data }): Promise<void> => {
    await fetchFromApi<void>(
      `/api/v1/saas/orgs/${data.orgId}/team/${data.memberId}`,
      { method: 'DELETE' },
    )
  })

// ---------------------------------------------------------------------------
// Usage
// ---------------------------------------------------------------------------

export const getUsageFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<Array<UsageRecord>> => {
    return await fetchFromApi<Array<UsageRecord>>(
      `/api/v1/saas/orgs/${data.orgId}/usage`,
    )
  })

export const getSettingsFn = createServerFn({ method: 'GET' })
  .inputValidator((data: { orgId: string }) => data)
  .handler(async ({ data }): Promise<SaasSettings> => {
    return await fetchFromApi<SaasSettings>(
      `/api/v1/saas/orgs/${data.orgId}/settings`,
    )
  })

export const updateSettingsFn = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { orgId: string; settings: { name: string; slug: string } }) => data,
  )
  .handler(async ({ data }): Promise<SaasSettings> => {
    return await fetchFromApi<SaasSettings>(
      `/api/v1/saas/orgs/${data.orgId}/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify(data.settings),
      },
    )
  })
