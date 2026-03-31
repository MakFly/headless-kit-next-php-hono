# Zustand + Next — SSR hydration

## Store sketch

```typescript
import { create } from 'zustand';

type MyState = { count: number };
type MyActions = { hydrate: (v: Partial<MyState>) => void; inc: () => void };

export const useMyStore = create<MyState & MyActions>((set) => ({
  count: 0,
  hydrate: (partial) => set(partial),
  inc: () => set((s) => ({ count: s.count + 1 })),
}));
```

## Rules

- Do not import the store in Server Components or `'use server'` modules
- Expose a `hydrate` (or equivalent) for data passed from RSC / layout
- Wire global hydration in `src/components/zustand-hydration.tsx` when the store must sync from server props

See `.claude/rules/zustand-stores.md`.
