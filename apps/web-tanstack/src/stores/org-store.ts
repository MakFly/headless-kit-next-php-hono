import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type OrgMembership = {
  id: string
  name: string
  slug: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
}

type OrgStore = {
  orgs: Array<OrgMembership>
  activeOrg: OrgMembership | null
  activeOrgRole: 'owner' | 'admin' | 'member' | 'viewer' | null
  isLoading: boolean
  isHydrated: boolean

  setOrgs: (orgs: Array<OrgMembership>) => void
  setActiveOrg: (org: OrgMembership) => void
  clearOrgs: () => void
  hasOrgPermission: (minRole: 'owner' | 'admin' | 'member' | 'viewer') => boolean
  setHydrated: () => void
}

const ROLE_HIERARCHY = { owner: 4, admin: 3, member: 2, viewer: 1 } as const

export const useOrgStore = create<OrgStore>()(
  persist(
    (set, get) => ({
      orgs: [],
      activeOrg: null,
      activeOrgRole: null,
      isLoading: false,
      isHydrated: false,

      setOrgs: (orgs) => {
        const current = get().activeOrg
        const stillValid = current && orgs.find((o) => o.id === current.id)
        const activeOrg = stillValid || orgs[0] || null
        set({
          orgs,
          activeOrg,
          activeOrgRole: activeOrg?.role || null,
        })
      },

      setActiveOrg: (org) => set({ activeOrg: org, activeOrgRole: org.role }),

      clearOrgs: () => set({ orgs: [], activeOrg: null, activeOrgRole: null }),

      hasOrgPermission: (minRole) => {
        const currentRole = get().activeOrgRole
        if (!currentRole) return false
        return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[minRole]
      },

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'org-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeOrg: state.activeOrg,
        activeOrgRole: state.activeOrgRole,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated()
      },
    },
  ),
)
