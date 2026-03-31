---
name: ts-page
description: Create a TanStack Start page with file-based routing, loader, and auth guard. Use when adding a new page or route.
argument-hint: <route-path>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create TanStack Page

Create a new page in `src/routes/`.

## Use when

- Adding a new page or route to the app
- Creating a section-specific page (dashboard, shop, saas, support)

## Default workflow

1. Create route file at the correct path in `src/routes/`
2. Define `createFileRoute` with:
   - `beforeLoad` for auth guard (if protected)
   - `loader` for data fetching
   - `component` for the React component
   - `pendingComponent` for loading state
3. Use `Route.useLoaderData()` in the component (not useEffect for data)
4. Run `bun run build` to regenerate `routeTree.gen.ts`

## Template

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$ARGUMENTS')({
  beforeLoad: async ({ context }) => {
    if (!context.user) throw redirect({ to: '/login' })
  },
  loader: async () => {
    const data = await myServerFn()
    return { data }
  },
  component: MyPage,
  pendingComponent: () => <div>Loading...</div>,
})

function MyPage() {
  const { data } = Route.useLoaderData()
  return <div>{/* render data */}</div>
}
```

## Guardrails

- Never edit `routeTree.gen.ts`
- Use `beforeLoad` for auth, not component-level checks
- Use `loader` for data, not `useEffect`
- Use `Route.useRouteContext()` for SSR data (no flash)

Target: $ARGUMENTS
