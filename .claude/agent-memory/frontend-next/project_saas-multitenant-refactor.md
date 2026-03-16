---
name: saas-multitenant-refactor
description: SaaS section refactored for multi-tenant orgs — all routes now scoped under /api/v1/saas/orgs/{orgId}/...
type: project
---

All SaaS backend routes changed from `/api/v1/saas/...` to `/api/v1/saas/orgs/{orgId}/...`.

New files created:
- `apps/web/src/stores/org-store.ts` — Zustand persist store for org list, active org, role hierarchy
- `apps/web/src/lib/actions/saas/orgs.ts` — listOrgsAction, createOrgAction, getOrgAction

Modified files:
- `apps/web/src/types/saas.ts` — added `OrgMembership` and `CreateOrgData` types
- `apps/web/src/lib/actions/saas/dashboard.ts` — getSaasDashboardAction takes `orgId` param
- `apps/web/src/lib/actions/saas/billing.ts` — all actions take `orgId` first param (except getPlansAction)
- `apps/web/src/lib/actions/saas/team.ts` — all actions take `orgId` first param
- `apps/web/src/lib/actions/saas/usage.ts` — all actions take `orgId` first param
- `apps/web/src/lib/query/keys.ts` — saas keys now include org() and dashboard(); subscription/invoices/team/usage/settings all scoped by orgId
- `apps/web/src/lib/query/saas.ts` — all hooks take `orgId`, removed MOCK fallbacks, enabled: !!orgId guard added

**Why:** Multi-tenant architecture — one user can belong to multiple orgs; all data must be isolated per org.

**How to apply:** When adding new SaaS server actions, always include `orgId` as the first parameter and build the URL as `/api/v1/saas/orgs/${orgId}/...`. Component pages in `(saas)/` that call these actions still need updating to pass `orgId` from the org store.
