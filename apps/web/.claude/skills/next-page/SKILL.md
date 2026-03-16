---
name: next-page
description: Create a Next.js page with App Router conventions. Use when the user asks to add a new page or route.
argument-hint: <route-path>
disable-model-invocation: true
---

# Create Next.js Page

Create a page in `src/app/`.

## Route Groups

The app uses route groups for different sections:

| Group | Path | Layout | Auth |
|-------|------|--------|------|
| `(dashboard)` | `/dashboard/*` | Sidebar + header | Required |
| `(shop)` | `/shop/*` | Shop layout | Optional (auth only for checkout/orders) |
| `(saas)` | `/saas/*` | SaaS layout | Required |
| `(support)` | `/support/*` | Support layout | Required |

Each section has its own nested auth routes at `<section>/auth/login` and `<section>/auth/register`.

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

## Client Component (when interactivity needed)

```tsx
'use client';

import { useActionState } from 'react';
import { createItemAction } from '@/lib/actions/items/actions';

export function CreateItemForm() {
  const [state, action, isPending] = useActionState(createItemAction, null);
  // ...
}
```

## Data Fetching Strategy

- **Default**: RSC + Server Action (no client JS)
- **TanStack Query**: Only for complex client filtering/pagination/optimistic updates
- See `.claude/rules/data-fetching-strategy.md`

## TanStack Query (opt-in)

```tsx
// Wrap with WithQuery provider only when needed
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

Edge middleware in `src/proxy.ts` handles auth redirects:
- `/dashboard`, `/saas`, `/support` require auth → redirect to `/<section>/auth/login`
- Auth pages redirect authenticated users to the section root
- `/shop` is public (no middleware protection)

## Nested layout example

```
src/app/
├── (dashboard)/
│   ├── layout.tsx          # Outer layout (none, or minimal shell)
│   └── dashboard/
│       ├── auth/
│       │   ├── login/page.tsx
│       │   └── register/page.tsx
│       └── (app)/
│           ├── layout.tsx  # Sidebar + header layout
│           ├── page.tsx    # /dashboard
│           ├── users/page.tsx
│           └── settings/page.tsx
```

Target: $ARGUMENTS
