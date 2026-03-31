---
name: next-component
description: Create a React component using shadcn/ui and Tailwind CSS. Use when the user asks to build a UI component.
argument-hint: <component-name>
disable-model-invocation: true
---

# Create React Component

Create components in `src/components/`.

## Convention

- Feature components: `src/components/{feature}/{component-name}.tsx`
- Shared UI: `src/components/ui/` (shadcn/ui managed, do not hand-edit)
- Use `type` not `interface` for props
- Use Tailwind CSS for styling, no CSS-in-JS
- Use lucide-react for icons

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

## UI library

shadcn/ui components live in `src/components/ui/`. Add new ones via:
```bash
bunx shadcn@latest add <component-name>
```

Never hand-edit files in `src/components/ui/` — they are managed by shadcn CLI.

## Available components (already installed)

accordion, alert-dialog, aspect-ratio, avatar, button, calendar, card, carousel, checkbox, collapsible, command, dialog, dropdown-menu, input, label, pagination, popover, progress, radio-group, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip

## Data table

For complex tables with sorting/filtering, use `src/components/data-table.tsx` (TanStack Table based).

## Charts

Use Recharts (already installed). Wrapper components live in `src/components/` (e.g., `chart-area-interactive.tsx`).

## Stores (Zustand)

```typescript
// src/stores/my-store.ts
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

Existing stores: `auth-store`, `cart-store`, `org-store`, `ai-preferences-store`.

## Auth awareness

```typescript
import { useAuthStore } from '@/stores/auth-store';

const user = useAuthStore((s) => s.user);
const isAdmin = useAuthStore((s) => s.isAdmin());
const hasPermission = useAuthStore((s) => s.hasPermission('posts', 'write'));
```

Target: $ARGUMENTS
