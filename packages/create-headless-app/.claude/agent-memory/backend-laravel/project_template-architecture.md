---
name: template-architecture
description: Key architectural patterns in the Laravel template (BetterAuth, ApiResponse, OrgRbac, i18n)
type: project
---

**Auth:** `auth:betterauth` guard (BetterAuth package). All protected routes use `middleware('auth:betterauth')`. Test helpers use `actingAs($user, 'betterauth')`.

**Response envelope:** `ApiResponse` static class in `app/Http/Helpers/ApiResponse.php`. Controllers use the `ApiResponder` trait. All responses are JSON with `{ success, data, status, request_id }`.

**RBAC:** Two-layer system:
1. Global RBAC via `role` / `permission` middleware aliases (CheckRole, CheckPermission). Admin routes use `middleware('role:admin')`.
2. Org-level RBAC via `OrgRbacMiddleware` aliased as `org.rbac`. Hierarchy: viewer(1) < member(2) < admin(3) < owner(4). Resolves org from `{orgId}` route param. Sets `org` and `orgMembership` on request.

**i18n:** `SetLocaleMiddleware` appended to `api` group. Parses `Accept-Language` header. Lang files at `lang/en/api.php` and `lang/fr/api.php`. All controllers use `__('api.domain.key')`.

**UUID PKs:** All models use `HasUuids` trait. User IDs come from BetterAuth (string UUIDs). `Cart` has a custom `newUniqueId()` override.

**Flat SaaS routes:** `/api/v1/saas/*` routes (no `orgId`) auto-resolve the authenticated user's first organization. Parallel org-scoped routes exist at `/api/v1/saas/orgs/{orgId}/*`.

**Domains:** Shop (products, categories, cart, orders), Admin Shop (CRUD + analytics + inventory + customers + reviews + segments), SaaS (plans, subscriptions, invoices, teams, usage, orgs), Support (conversations, messages, canned responses, agent queue).

**Why:** Keeping patterns consistent across template and monorepo ensures generated projects have the same architecture as the reference implementation.
