---
paths:
  - "apps/web/**/*"
---

# Zustand Stores

## Existing stores

| Store | File | Purpose |
|-------|------|---------|
| `auth-store` | `stores/auth-store.ts` | User state, login/logout/OAuth/magic-link |
| `cart-store` | `stores/cart-store.ts` | Shopping cart items |
| `org-store` | `stores/org-store.ts` | Active organization (SaaS) |
| `ai-preferences-store` | `stores/ai-preferences-store.ts` | AI provider/model selection |

## SSR hydration

Client stores are hydrated from server data via `src/components/zustand-hydration.tsx` in the root layout.

## Critical rules

- **Never read auth state in Server Components** — use Server Actions (`getCurrentUserAction()`) instead
- **Never import stores in `'use server'` files** — stores are client-only
- Auth flow: Server Action returns user → Zustand stores it client-side
- Use `type` for all store types (consistent with TypeScript rule)

## Store pattern

```typescript
import { create } from 'zustand'

type MyState = {
  items: Item[]
  isLoading: boolean
}

type MyActions = {
  addItem: (item: Item) => void
  hydrate: (items: Item[]) => void
}

export const useMyStore = create<MyState & MyActions>((set) => ({
  items: [],
  isLoading: false,
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  hydrate: (items) => set({ items, isLoading: false }),
}))
```
