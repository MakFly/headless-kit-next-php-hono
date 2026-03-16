---
name: project_saas-multi-tenant
description: Multi-tenant orgs implemented in Laravel SaaS section — OrgRbacMiddleware, OrgController, org-scoped routes via {orgId}
type: project
---

Multi-tenant organization support added to `apps/api-laravel` (2026-03-15).

**Why:** The SaaS section was 1-org-per-user via `resolveOrg()`. Needed full multi-org support with per-org RBAC.

**How to apply:** When touching SaaS routes or the Saas/Org controllers, remember:
- All org-scoped routes are nested under `/api/v1/saas/orgs/{orgId}/`
- `OrgRbacMiddleware` (alias `org.rbac`) sets `org` and `orgMembership` on `$request->attributes`
- `SaasController` methods read org from `$request->attributes->get('org')` — never call `resolveOrg()` or query by `owner_id`
- Role hierarchy in `OrgRbacMiddleware::ROLE_HIERARCHY`: viewer(1) < member(2) < admin(3) < owner(4)
- `subscribe()` no longer auto-creates orgs — org must already exist (enforced by `org.rbac:owner` middleware)
- `User::teamMemberships()` HasMany relation to `TeamMember` added
- `SaasSeeder` creates 2 orgs for admin: "Acme Corp" (Pro plan, subscription, team) + "Side Project" (no subscription)
