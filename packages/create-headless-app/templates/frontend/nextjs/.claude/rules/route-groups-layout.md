# Route Groups & Layout Structure

## 4 route groups

| Group | URL path | Auth required | Layout |
|-------|----------|---------------|--------|
| `(dashboard)` | `/dashboard/*` | Yes | Sidebar + header |
| `(shop)` | `/shop/*` | No (except checkout/orders) | Shop storefront |
| `(saas)` | `/saas/*` | Yes | SaaS app layout |
| `(support)` | `/support/*` | Yes | Support helpdesk |

## Nesting pattern

```
src/app/
├── (dashboard)/
│   └── dashboard/
│       ├── auth/               # Auth pages (login, register, forgot-password, reset-password)
│       │   └── layout.tsx      # Auth layout (no sidebar)
│       └── (app)/              # Protected app pages
│           ├── layout.tsx      # Sidebar + header layout
│           └── page.tsx        # /dashboard
```

**Critical**: Pages go under `(app)/`, NOT directly under `dashboard/`. The `(app)` group applies the sidebar layout.

## Each section has its own auth pages

Every section has auth pages at `<section>/auth/login` and `<section>/auth/register`. This means 4 sets of auth pages that share the same components but redirect to different section roots.

## Edge middleware (`src/proxy.ts`)

- Protected routes: `/dashboard`, `/saas`, `/support` → redirect to `/<section>/auth/login`
- Auth pages: redirect authenticated users to section root
- `/shop` is public (no middleware protection)
- API routes (`/api/v1/*`): proactive token refresh

## Pitfalls

- Creating a page at `(dashboard)/dashboard/users/page.tsx` instead of `(dashboard)/dashboard/(app)/users/page.tsx` → missing sidebar
- Forgetting to add auth pages for a new section
- Not updating `proxy.ts` when adding a new protected section
