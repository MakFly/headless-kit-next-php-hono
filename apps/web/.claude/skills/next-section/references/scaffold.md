# New route section — scaffold

## Workflow

1. Route group: `src/app/(<section>)/<section>/`
2. Auth:
   - `auth/layout.tsx` — centered, no sidebar
   - `auth/login/page.tsx`, `auth/register/page.tsx`
3. App shell:
   - `(app)/layout.tsx` — sidebar + header
   - `(app)/page.tsx` — section home
4. `src/proxy.ts` — protect `/<section>` (mirror dashboard/saas/support)
5. `src/components/app-sidebar.tsx` — nav entry for the section

## Guardrails

- Reuse `src/components/auth/*`
- Post-login redirect to `/<section>` (not hardcoded `/dashboard`)
- Keep naming consistent with existing route groups — see `.claude/rules/route-groups-layout.md`
