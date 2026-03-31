# Components — UI, tables, charts, stores

## Template

```tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ItemCardProps = {
  title: string;
  description: string;
  onAction: () => void;
};

export function ItemCard({ title, description, onAction }: ItemCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button onClick={onAction} className="mt-4">
          Action
        </Button>
      </CardContent>
    </Card>
  );
}
```

## shadcn/ui

Add primitives via:

```bash
bunx shadcn@latest add <component-name>
```

Never hand-edit `src/components/ui/`.

Installed (non-exhaustive): accordion, alert-dialog, aspect-ratio, avatar, button, calendar, card, carousel, checkbox, collapsible, command, dialog, dropdown-menu, input, label, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.

## Data table

Complex tables: `src/components/data-table.tsx` (TanStack Table).

## Charts

Recharts — see existing wrappers under `src/components/` (e.g. `chart-area-interactive.tsx`).

## Zustand (new store sketch)

```typescript
import { create } from 'zustand';

type MyStore = {
  items: Item[];
  setItems: (items: Item[]) => void;
};

export const useMyStore = create<MyStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}));
```

Existing: `auth-store`, `cart-store`, `org-store`, `ai-preferences-store`.

## Auth in UI

```typescript
import { useAuthStore } from '@/stores/auth-store';

const user = useAuthStore((s) => s.user);
const isAdmin = useAuthStore((s) => s.isAdmin());
const hasPermission = useAuthStore((s) => s.hasPermission('posts', 'write'));
```
