---
name: saas-api-platform
description: SaaS entities ApiResource status and processor location after March 2026 decoration sprint
type: project
---

All 6 SaaS entities in `src/Shared/Entity/` now carry `#[ApiResource]` attributes (API Platform 4) with `/api/v1/saas/` prefixed routes and serialization groups on properties.

| Entity | Routes | Groups |
|--------|--------|--------|
| Plan | GET /plans, GET /plans/{id} | plan:read |
| Organization | GET/POST /organizations | org:read, org:write |
| Subscription | GET /organizations/{organizationId}/subscription | subscription:read |
| Invoice | GET /invoices | invoice:read |
| TeamMember | GET/POST /team, PATCH/DELETE /team/{id} | team:read, team:write |
| UsageRecord | GET /usage | usage:read |

**Why:** API Platform 4 decoration sprint to expose SaaS resources via the standard collection/item operations.

**How to apply:** When adding filters or state providers for org-scoping, target these entities. The `TeamMemberProcessor` lives at `src/Shared/ApiPlatform/State/TeamMemberProcessor.php` and already enforces org-admin guard logic.
