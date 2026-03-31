# TanStack Start — component patterns

## Template

```tsx
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

type MyWidgetProps = {
  items: Item[]
  onAction?: (id: string) => void
}

export function MyWidget({ items, onAction }: MyWidgetProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>{/* render items */}</CardContent>
    </Card>
  )
}
```

## Guardrails

- `~/` path alias for imports
- `type` not `interface` for props
- SSR display: prefer `Route.useRouteContext()` over raw Zustand to avoid UI flash
- Mutations: Zustand store actions
- No `useEffect` for initial data fetch

## Auth / layout

Sidebar, header, layout: user from route context. Actions: `useAuthStore`. Hydrate store in `useEffect` when syncing from context — see app `CLAUDE.md`.
