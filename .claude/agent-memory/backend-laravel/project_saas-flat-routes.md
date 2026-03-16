---
name: saas-flat-routes
description: SaaS routes have two layers — flat routes (no orgId) and org-scoped routes (with orgId)
type: project
---

The SaaS API has two parallel route sets added in March 2026:

**Flat routes** (no orgId, auto-resolve user's first org as owner):
- `/api/v1/saas/subscription` (GET/POST/DELETE)
- `/api/v1/saas/invoices`, `/api/v1/saas/team`, `/api/v1/saas/dashboard`
- `/api/v1/saas/usage`, `/api/v1/saas/settings`
- `/api/v1/saas/team/invite`, `/api/v1/saas/team/{id}/role`, `/api/v1/saas/team/{id}`
- Handled by `flatSubscribe()`, `flatGetSubscription()`, etc. in SaasController
- Auto-create org if none exists (for subscribe flow)

**Org-scoped routes** (with orgId, OrgRbacMiddleware):
- `/api/v1/saas/orgs/{orgId}/subscription`, etc.
- Handled by `getSubscription()`, `listTeam()`, etc.

**Why:** tests use flat URLs without orgId. The flat routes coexist with org-scoped routes without conflict because Laravel matches them first (registered before the orgId routes).

**How to apply:** prefer flat routes for simple single-org user flows; prefer org-scoped routes when multi-org or RBAC role checking is needed.
