---
name: next-action
description: Create a Server Action that communicates with the backend via the BFF client. Use when the user asks to add a server action, API call, or data fetching function.
argument-hint: <feature/action-name>
disable-model-invocation: true
---

# Create Server Action

Create a Server Action in `src/lib/actions/`.

## CRITICAL RULE

**All Server Actions that communicate with the backend MUST use the bff-client.** Never use `fetch()` directly. See `.claude/rules/server-actions-bff-client.md`.

```typescript
'use server';

import { bffGet, bffPost } from '../_shared/bff-client';

export async function listItemsAction() {
  const response = await bffGet<{ data: Item[] }>('/api/v1/items');
  return response.data;
}

export async function createItemAction(data: CreateItemInput) {
  const response = await bffPost<{ data: Item }>('/api/v1/items', data);
  return response.data;
}
```

## BFF Client API

| Function | Usage |
|----------|-------|
| `bffGet<T>(endpoint, options?)` | GET request |
| `bffPost<T>(endpoint, body?, options?)` | POST request |
| `bffPut<T>(endpoint, body?, options?)` | PUT request |
| `bffPatch<T>(endpoint, body?, options?)` | PATCH request |
| `bffDelete<T>(endpoint, options?)` | DELETE request |

## Auth actions (public routes)

For login/register, use `skipAuth: true`:
```typescript
const response = await bffPost<AuthResponse>(
  '/api/v1/auth/login',
  credentials,
  { skipAuth: true }
);
```

## Error handling

```typescript
import { BffActionError } from '../_shared/errors';
import { redirect } from 'next/navigation';

try {
  return await bffGet<Data>('/api/v1/protected');
} catch (error) {
  if (error instanceof BffActionError && error.statusCode === 401) {
    redirect('/dashboard/auth/login');
  }
  throw error;
}
```

## File structure

```
src/lib/actions/
├── _shared/
│   ├── bff-client.ts    # HTTP client (USE THIS)
│   ├── errors.ts        # BffActionError
│   ├── envelope.ts      # Response envelope types
│   └── index.ts
├── auth/actions.ts
├── rbac/{users,roles,permissions}.ts
├── shop/actions.ts
├── saas/actions.ts
└── support/actions.ts
```

## TypeScript

Use `type` not `interface` (see `.claude/rules/typescript-types-over-interfaces.md`).

Target: $ARGUMENTS
