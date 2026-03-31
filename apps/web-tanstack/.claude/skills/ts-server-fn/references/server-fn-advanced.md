# createServerFn — patterns

## GET (no input)

```typescript
import { createServerFn } from '@tanstack/react-start'
import { getAuthAdapter } from '../adapters'

export const listThings = createServerFn({ method: 'GET' }).handler(async () => {
  const adapter = getAuthAdapter()
  return adapter.someMethod()
})
```

## POST + Zod

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthAdapter } from '../adapters'

export const createThing = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
    })
  )
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    return adapter.someMethod(data)
  })
```

## Guardrails

- Single structured `data` argument for validated fns
- Validate all client-supplied input at the boundary
- Prefer `.middleware([...]).handler(...)` when auth/logging needed
- Avoid dynamic imports inside server functions
- Auth-centric RPC: keep in `lib/server/auth.ts`; domain ops in `lib/services/*`
