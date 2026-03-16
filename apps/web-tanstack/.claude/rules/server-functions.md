# Server Functions — Conventions

## Création

Toujours utiliser `createServerFn()` de `@tanstack/react-start`. Ne jamais faire de `fetch()` direct vers les backends.

```tsx
import { createServerFn } from '@tanstack/react-start'

// GET (défaut) — pour la lecture
export const getUsers = createServerFn().handler(async () => {
  return db.query.users.findMany()
})

// POST — pour les mutations
export const createUser = createServerFn({ method: 'POST' })
  .handler(async ({ data }) => {
    return db.insert(users).values(data)
  })
```

## Validation des inputs

Toujours valider les inputs avec un `inputValidator` (Zod recommandé) :

```tsx
import { z } from 'zod'

export const getUser = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    return findUserById(data.id)
  })
```

## Appel

```tsx
// Dans un loader
export const Route = createFileRoute('/posts')({
  loader: () => getPosts(),
})

// Dans un composant (avec useServerFn ou React Query)
const { data } = useQuery({
  queryKey: ['posts'],
  queryFn: () => getPosts(),
})
```

## Organisation des fichiers

```
src/
├── lib/services/       # createServerFn wrappers (importable partout)
├── lib/server/         # Logique serveur pure (DB queries, helpers)
└── lib/schemas/        # Schémas Zod partagés
```

- Les fichiers `.server.ts` contiennent la logique serveur-only (DB, secrets)
- Les server functions sont des wrappers fins autour de cette logique

## Gestion des erreurs

```tsx
import { redirect, notFound } from '@tanstack/react-router'

export const requireAuth = createServerFn().handler(async () => {
  const user = await getCurrentUser()
  if (!user) throw redirect({ to: '/login' })
  return user
})

export const getPost = createServerFn()
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    const post = await findPost(data.id)
    if (!post) throw notFound()
    return post
  })
```

## Accès HTTP (headers, cookies, status)

```tsx
import {
  getRequest,
  getRequestHeader,
  setResponseHeaders,
  setResponseStatus,
} from '@tanstack/react-start/server'

export const getCachedData = createServerFn({ method: 'GET' }).handler(async () => {
  const authHeader = getRequestHeader('Authorization')
  setResponseHeaders(new Headers({ 'Cache-Control': 'public, max-age=300' }))
  setResponseStatus(200)
  return fetchData()
})
```

## Règles

- **Un seul paramètre `data`** : les server functions acceptent un seul objet `data`
- **Toujours valider** : les inputs traversent le réseau, donc validation obligatoire
- **Pas d'import dynamique** : utiliser des imports statiques (le bundler remplace l'implémentation par un stub RPC côté client)
- **Middleware avant handler** : `.middleware([...]).handler(...)` pour l'auth et la validation
