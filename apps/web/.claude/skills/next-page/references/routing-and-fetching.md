# Pages — route groups, RSC, client, middleware

## Route groups

| Group | Path | Layout | Auth |
|-------|------|--------|------|
| `(dashboard)` | `/dashboard/*` | Sidebar + header | Required |
| `(shop)` | `/shop/*` | Shop layout | Optional (auth for checkout/orders) |
| `(saas)` | `/saas/*` | SaaS layout | Required |
| `(support)` | `/support/*` | Support layout | Required |

Each section: nested auth at `<section>/auth/login` and `register`.

## Server Component (default)

```tsx
// src/app/(dashboard)/dashboard/(app)/items/page.tsx
import { listItemsAction } from '@/lib/actions/items/actions';
import { ItemsTable } from '@/components/items/items-table';

export default async function ItemsPage() {
  const items = await listItemsAction();
  return <ItemsTable items={items} />;
}
```

## Client Component (interactivity)

```tsx
'use client';

import { useActionState } from 'react';
import { createItemAction } from '@/lib/actions/items/actions';

export function CreateItemForm() {
  const [state, action, isPending] = useActionState(createItemAction, null);
  // ...
}
```

## Data fetching

- Default: RSC + Server Action — see `.claude/rules/data-fetching-strategy.md`
- TanStack Query: only for heavy client cache / optimistic / polling — wrap with `WithQuery` from `@/lib/query`

```tsx
import { WithQuery } from '@/lib/query';

export default function ItemsPage() {
  return (
    <WithQuery>
      <ItemsManager />
    </WithQuery>
  );
}
```

## Protected routes

`src/proxy.ts`: `/dashboard`, `/saas`, `/support` require auth → redirect to `/<section>/auth/login`; auth routes redirect logged-in users to section root; `/shop` public.

## Nested layout example

```
src/app/
├── (dashboard)/
│   ├── layout.tsx
│   └── dashboard/
│       ├── auth/
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       └── (app)/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── users/page.tsx
│           └── settings/page.tsx
```
