import type { ReactNode } from 'react'
import { useOrgStore } from '@/stores/org-store'

type OrgRbacGuardProps = {
  minRole: 'owner' | 'admin' | 'member' | 'viewer'
  children: ReactNode
  fallback?: ReactNode
}

export function OrgRbacGuard({ minRole, children, fallback = null }: OrgRbacGuardProps) {
  const { hasOrgPermission } = useOrgStore()

  if (!hasOrgPermission(minRole)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
