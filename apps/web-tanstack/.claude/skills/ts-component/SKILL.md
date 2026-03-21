---
name: ts-component
description: Create a React component for TanStack Start with proper data access patterns. Use when building UI components.
argument-hint: <ComponentName>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create TanStack Component

Create a React component in `src/components/`.

## Use when

- Building a new UI component
- Creating a feature-specific component (dashboard, shop, saas, support)

## Default workflow

1. Create component file at `src/components/{domain}/$ARGUMENTS.tsx`
2. Use `type` for all prop types (never `interface`)
3. Use shadcn/ui primitives from `~/components/ui/`
4. Access data via props (passed from loader) or `Route.useRouteContext()`

## Template

```tsx
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

type ${Name}Props = {
  items: Item[]
  onAction?: (id: string) => void
}

export function $ARGUMENTS({ items, onAction }: ${Name}Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        {/* render items */}
      </CardContent>
    </Card>
  )
}
```

## Guardrails

- Use `~/` path alias for imports
- `type` not `interface` for props
- SSR display data: use `Route.useRouteContext()` (not Zustand)
- Mutations: use Zustand store actions
- No `useEffect` for initial data fetching

Component: $ARGUMENTS
