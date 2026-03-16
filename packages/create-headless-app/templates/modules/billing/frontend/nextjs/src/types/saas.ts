// ============================================
// SaaS Types
// ============================================

export type Organization = {
  id: string
  name: string
  slug: string
  ownerId: string
  planId: string | null
  plan?: Plan
  createdAt: string
  updatedAt: string
}

export type Plan = {
  id: string
  name: string
  slug: string
  priceMonthly: number // cents
  priceYearly: number // cents
  features: string[]
  limits: PlanLimits
}

export type PlanLimits = {
  maxMembers: number
  maxProjects: number
  maxStorage: number // in MB
  apiCallsPerMonth: number
}

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing'

export type Subscription = {
  id: string
  organizationId: string
  planId: string
  plan?: Plan
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  createdAt: string
}

export type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'void'

export type Invoice = {
  id: string
  organizationId: string
  amount: number // cents
  status: InvoiceStatus
  periodStart: string
  periodEnd: string
  paidAt: string | null
  createdAt: string
}

export type TeamRole = 'owner' | 'admin' | 'member' | 'viewer'

export type TeamMember = {
  id: string
  organizationId: string
  userId: string
  user?: { name: string; email: string; avatarUrl: string | null }
  role: TeamRole
  joinedAt: string
}

export type TeamInvite = {
  email: string
  role: TeamRole
}

export type UsageMetric = 'api_calls' | 'storage' | 'members' | 'projects'

export type UsageRecord = {
  id: string
  organizationId: string
  metric: UsageMetric
  value: number
  limit: number
  recordedAt: string
}

export type SaasDashboard = {
  activeMembers: number
  totalProjects: number
  apiCallsThisMonth: number
  storageUsed: number // MB
  currentPlan: Plan | null
  recentActivity: ActivityEntry[]
}

export type ActivityEntry = {
  id: string
  action: string
  actor: string
  target: string
  createdAt: string
}

export type SaasSettings = {
  organizationName: string
  slug: string
  timezone: string
  language: string
  notifications: {
    email: boolean
    billing: boolean
    usage: boolean
  }
}

export type CreateOrgData = {
  name: string
  slug: string
}

export type OrgMembership = {
  id: string
  name: string
  slug: string
  role: TeamRole
}
