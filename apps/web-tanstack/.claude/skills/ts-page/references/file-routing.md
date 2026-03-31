# TanStack Start — file routes, loader, auth

## Route template

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/your/path')({
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
  return <div>{/* render */}</div>
}
```

## Guardrails

- Never edit `routeTree.gen.ts`
- Auth in `beforeLoad`, not only in components
- Data in `loader` + `useLoaderData`, not `useEffect` for initial load
- `Route.useRouteContext()` for SSR-safe user/session

After adding routes: `bun run build` regenerates the route tree.
