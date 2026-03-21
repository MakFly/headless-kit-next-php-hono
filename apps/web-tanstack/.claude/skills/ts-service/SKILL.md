---
name: ts-service
description: Create a service file with createServerFn wrappers and fetchFromApi calls. Use when adding server-side data operations for a new feature.
argument-hint: <service-name>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create Service

Create a new service in `src/lib/services/`.

## Use when

- Adding server-side data operations for a new feature
- Need to wrap backend API calls in type-safe server functions

## Default workflow

1. Create `src/lib/services/$ARGUMENTS-service.ts`
2. Import `fetchFromApi` from `../http/fetch-api`
3. Import `createServerFn` from `@tanstack/react-start`
4. Define server functions with Zod input validation
5. Export all functions for use in loaders and components

## Template

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { fetchFromApi } from '../http/fetch-api'

export const list${Name}Fn = createServerFn({ method: 'GET' })
  .handler(async () => {
    return fetchFromApi<${Name}[]>('/${path}')
  })

export const get${Name}Fn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return fetchFromApi<${Name}>(`/${path}/${data.id}`)
  })

export const create${Name}Fn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    return fetchFromApi<${Name}>('/${path}', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  })
```

## Guardrails

- Always use `fetchFromApi` (not direct fetch)
- Always validate inputs with Zod `inputValidator`
- Auth operations go in `lib/server/auth.ts`, not services
- One service file per feature domain

Service: $ARGUMENTS
