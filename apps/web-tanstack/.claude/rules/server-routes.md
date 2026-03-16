# Server Routes — Conventions

## Définition

Les server routes sont des endpoints HTTP définis dans `src/routes/` via la propriété `server` de `createFileRoute`.

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/api/hello')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return Response.json({ message: 'Hello!' })
      },
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ received: body })
      },
    },
  },
})
```

## Convention de fichiers

| Fichier | Route |
|---------|-------|
| `routes/users.ts` | `/users` |
| `routes/users/$id.ts` | `/users/$id` |
| `routes/api/file/$.ts` | `/api/file/$` (wildcard) |
| `routes/users[.]json.ts` | `/users.json` |

**Contrainte** : un seul fichier handler par chemin. Pas de doublons (`users.ts` + `users/index.ts`).

## Paramètres dynamiques

```tsx
// routes/users/$id.ts
export const Route = createFileRoute('/users/$id')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        return Response.json({ userId: params.id })
      },
    },
  },
})

// Wildcard — routes/file/$.ts
export const Route = createFileRoute('/file/$')({
  server: {
    handlers: {
      GET: async ({ params }) => {
        return new Response(`File: ${params._splat}`)
      },
    },
  },
})
```

## Handler context

Chaque handler reçoit `{ request, params, context }` :

- `request` : objet Request standard (Web API)
- `params` : paramètres dynamiques de l'URL
- `context` : contexte injecté par les middleware

## Middleware sur les routes

```tsx
// Middleware global à la route (tous les handlers)
export const Route = createFileRoute('/api/admin')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ request }) => Response.json({ ok: true }),
    },
  },
})

// Middleware par handler (via createHandlers)
export const Route = createFileRoute('/api/data')({
  server: {
    middleware: [authMiddleware], // s'applique à tous
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: async ({ request }) => Response.json({ public: true }),
        POST: {
          middleware: [validationMiddleware], // s'applique au POST seulement
          handler: async ({ request }) => {
            const body = await request.json()
            return Response.json({ created: true })
          },
        },
      }),
  },
})
```

## Route hybride (server + client)

Un même fichier peut définir un endpoint serveur ET un composant client :

```tsx
export const Route = createFileRoute('/hello')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json()
        return Response.json({ message: `Hello, ${body.name}!` })
      },
    },
  },
  component: HelloComponent,
})
```

## Réponses

- **JSON** : `Response.json({ data })` (préféré)
- **Texte** : `new Response('text', { headers: { 'Content-Type': 'text/plain' } })`
- **Status codes** : `new Response('Not found', { status: 404 })`
- **Headers custom** : via le second argument de `new Response()`

## Règles

- Méthodes supportées : GET, POST, PUT, PATCH, DELETE
- Utiliser `Response.json()` pour les réponses JSON (plus propre que `JSON.stringify`)
- Les server routes sont dans le même répertoire que les routes client
- Préférer les **server functions** pour les appels depuis les composants (type-safe, RPC)
- Réserver les **server routes** pour les endpoints HTTP purs (webhooks, API publique, proxy)
