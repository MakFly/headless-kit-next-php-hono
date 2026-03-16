# Middleware — Conventions

## Deux types de middleware

| | Request Middleware | Function Middleware |
|---|---|---|
| Scope | Toutes les requêtes (routes, SSR, server functions) | Server functions uniquement |
| Création | `createMiddleware()` | `createMiddleware({ type: 'function' })` |
| Méthodes | `.server()` | `.client()`, `.server()`, `.inputValidator()`, `.middleware()` |
| Client logic | Non | Oui |

## Création

```tsx
import { createMiddleware } from '@tanstack/react-start'

// Request middleware (toutes requêtes)
const loggingMiddleware = createMiddleware().server(({ next }) => {
  console.log('Request received')
  return next()
})

// Function middleware (server functions only)
const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next, request }) => {
    const session = await auth.getSession({ headers: request.headers })
    if (!session) throw new Error('Unauthorized')
    return next({ context: { session } })
  },
)
```

## Chaînage et composition

```tsx
// Un middleware peut dépendre d'un autre
const authzMiddleware = createMiddleware({ type: 'function' })
  .middleware([authMiddleware]) // dépend de authMiddleware
  .server(async ({ next, context }) => {
    // context.session est disponible via authMiddleware
    if (!context.session.isAdmin) throw new Error('Forbidden')
    return next()
  })
```

## Passage de contexte

**Toujours utiliser `next({ context: { ... } })`** pour passer des données au handler :

```tsx
const middleware = createMiddleware({ type: 'function' }).server(({ next }) => {
  return next({
    context: { userId: '123', role: 'admin' },
  })
})

// Le handler reçoit le contexte
const fn = createServerFn()
  .middleware([middleware])
  .handler(async ({ context }) => {
    console.log(context.userId) // '123'
  })
```

## Client → Server context

Le contexte client n'est PAS transmis automatiquement. Utiliser `sendContext` :

```tsx
const middleware = createMiddleware({ type: 'function' })
  .client(async ({ next, context }) => {
    return next({
      sendContext: { workspaceId: context.workspaceId },
    })
  })
  .server(async ({ next, context }) => {
    // TOUJOURS valider le contexte venant du client
    const workspaceId = z.string().parse(context.workspaceId)
    return next()
  })
```

## Middleware factories (paramétrable)

```tsx
export function requirePermission(permissions: Record<string, string[]>) {
  return createMiddleware({ type: 'function' })
    .middleware([authMiddleware])
    .server(async ({ next, context }) => {
      const granted = await checkPermissions(context.session, permissions)
      if (!granted) throw new Error('Forbidden')
      return next()
    })
}

// Usage
const fn = createServerFn()
  .middleware([requirePermission({ posts: ['read'] })])
  .handler(async () => { /* ... */ })
```

## Global middleware (`src/start.ts`)

```tsx
import { createStart, createMiddleware } from '@tanstack/react-start'

export const startInstance = createStart(() => ({
  requestMiddleware: [globalRequestMiddleware],
  functionMiddleware: [globalFunctionMiddleware],
}))
```

## Headers personnalisés (côté client)

```tsx
const withAuth = createMiddleware({ type: 'function' }).client(async ({ next }) => {
  return next({
    headers: { Authorization: `Bearer ${getToken()}` },
  })
})
```

## Ordre d'exécution

Global request → Global function → Local (depth-first par dépendances) → Handler

## Règles

- **Toujours appeler `next()`** dans un middleware, sinon la chaîne est coupée
- **Valider tout contexte venant du client** : c'est une frontière réseau
- **Tree-shaking** : le code dans `.server()` est supprimé du bundle client
- **Ordre TypeScript** : `.inputValidator()` → `.client()` → `.server()` → `.middleware()`
