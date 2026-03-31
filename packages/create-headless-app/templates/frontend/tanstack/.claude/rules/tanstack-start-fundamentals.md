# TanStack Start — Principes fondamentaux

## Architecture

TanStack Start est un framework full-stack React basé sur TanStack Router + Vite. Il unifie client et serveur dans un seul codebase avec :

- **File-based routing** : les fichiers dans `src/routes/` définissent automatiquement les routes
- **SSR natif** : rendu serveur intégré avec hydratation client
- **Server functions** : logique serveur appelable depuis le client avec type-safety
- **Middleware composable** : chaînes de middleware pour auth, validation, logging

## Imports

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { createMiddleware } from '@tanstack/react-start'
```

## Path aliases

Utiliser `~/` pour pointer vers `src/` :

```tsx
import { Input } from '~/components/ui/input'
```

Configuré dans `tsconfig.json` (`"~/*": ["./src/*"]`) + `vite-tsconfig-paths`.

## Rendu et données

- **SSR** : `beforeLoad` et `loader` s'exécutent côté serveur au premier rendu
- **Route context** : `Route.useRouteContext()` pour accéder aux données SSR (pas de flash UI)
- **Zustand** : pour les mutations client uniquement (login, logout)
- **React Query** : pour le cache et les refetch côté client
