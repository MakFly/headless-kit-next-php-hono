---
name: next-section
description: Scaffold a new route group section with auth pages, layouts, and middleware. Use when adding a new section like dashboard, shop, saas, support.
argument-hint: <section-name>
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Scaffold New Section

Create a new route group section with complete auth + app layout.

## Use when

- Adding a new major section to the app (like a 5th section alongside dashboard/shop/saas/support)

## Default workflow

1. Create route group directory: `src/app/($ARGUMENTS)/$ARGUMENTS/`
2. Create auth pages:
   - `auth/layout.tsx` — auth layout (centered, no sidebar)
   - `auth/login/page.tsx` — login page for this section
   - `auth/register/page.tsx` — register page
3. Create app layout:
   - `(app)/layout.tsx` — sidebar + header layout
   - `(app)/page.tsx` — section homepage
4. Update `src/proxy.ts` — add auth protection rules for `/$ARGUMENTS`

## Guardrails

- Reuse existing auth components from `src/components/auth/`
- Auth pages redirect to `/$ARGUMENTS` after login (not `/dashboard`)
- Add the section to the sidebar navigation in `src/components/app-sidebar.tsx`

## Output contract

- Route group with auth + app layouts
- Middleware protection in proxy.ts
- Section accessible at `/$ARGUMENTS`

Section: $ARGUMENTS
