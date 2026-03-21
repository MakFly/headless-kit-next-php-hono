---
name: ts-server-fn
description: Create a server function with createServerFn, middleware, and Zod validation. Use when adding server-side logic callable from components.
argument-hint: <functionName>
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Create Server Function

Create a server function using `createServerFn`.

## Use when

- Adding new server-side logic callable from components or loaders
- Need type-safe RPC between client and server

## Default workflow

1. Choose the right file: `lib/server/auth.ts` for auth, `lib/services/*.ts` for data
2. Define with `createServerFn({ method: 'GET' | 'POST' })`
3. Add `inputValidator` with Zod schema if the function accepts data
4. Implement handler with adapter calls or fetchFromApi

## Template

```typescript
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { getAuthAdapter } from '../adapters'

// GET — no input
export const $ARGUMENTS = createServerFn({ method: 'GET' })
  .handler(async () => {
    const adapter = getAuthAdapter()
    return adapter.someMethod()
  })

// POST — with input validation
export const $ARGUMENTS = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }))
  .handler(async ({ data }) => {
    const adapter = getAuthAdapter()
    return adapter.someMethod(data)
  })
```

## Guardrails

- Single `data` parameter (object) — server functions accept one argument
- Always validate inputs that cross the network boundary
- `.server()` code is tree-shaken from client bundle
- Never use dynamic imports in server functions
- Middleware chain: `.middleware([...]).handler(...)`

Function: $ARGUMENTS
