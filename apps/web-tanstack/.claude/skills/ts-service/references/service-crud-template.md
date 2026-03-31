# Service file — CRUD via fetchFromApi

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { fetchFromApi } from '../http/fetch-api'

export const listItemsFn = createServerFn({ method: 'GET' }).handler(async () => {
  return fetchFromApi<Item[]>('/items')
})

export const getItemFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return fetchFromApi<Item>(`/items/${data.id}`)
  })

export const createItemFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    return fetchFromApi<Item>('/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  })
```

## Guardrails

- Always `fetchFromApi`, never raw `fetch` to the API
- Zod `inputValidator` on every fn that accepts input
- Auth flows stay in `lib/server/auth.ts`
- One service module per domain
