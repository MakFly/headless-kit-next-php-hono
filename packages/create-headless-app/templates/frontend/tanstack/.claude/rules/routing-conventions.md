# Routing — Conventions

## File-based routing

Les routes sont définies dans `src/routes/`. TanStack Router génère automatiquement `routeTree.gen.ts`.

### Structure des fichiers

```
src/routes/
├── __root.tsx           # Layout racine (wraps tout)
├── index.tsx            # Page d'accueil (/)
├── _auth.tsx            # Layout pathless (pas d'URL, wraps les enfants)
├── _auth/
│   ├── login.tsx        # /login
│   └── register.tsx     # /register
├── dashboard.tsx        # Layout /dashboard
├── dashboard/
│   ├── index.tsx        # /dashboard (page principale)
│   └── settings.tsx     # /dashboard/settings
├── shop.tsx             # Layout /shop
├── shop/
│   └── ...
└── api/
    └── v1/
        └── $.tsx        # Catch-all /api/v1/* (proxy BFF)
```

### Conventions de nommage

| Pattern | Signification |
|---------|---------------|
| `index.tsx` | Route index du dossier parent |
| `$param.tsx` | Paramètre dynamique |
| `$.tsx` | Catch-all (splat) |
| `_layout.tsx` | Layout pathless (ne crée pas de segment URL) |
| `route[.]ext.tsx` | Échappe le point (ex: `users[.]json.tsx` → `/users.json`) |

## Définition d'une route

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  // Exécuté avant le loader (auth checks, redirects)
  beforeLoad: async ({ context }) => {
    if (!context.user) throw redirect({ to: '/login' })
    return { permissions: await getPermissions(context.user.id) }
  },

  // Chargement des données (SSR + client)
  loader: async () => {
    return { stats: await getDashboardStats() }
  },

  // Composant React
  component: DashboardPage,

  // Gestion des erreurs
  errorComponent: DashboardError,

  // Pending UI
  pendingComponent: DashboardSkeleton,
})
```

## Data loading

### `beforeLoad` — guards et contexte

- S'exécute AVANT le loader
- Idéal pour : auth checks, redirects, enrichir le contexte
- Le contexte retourné est accessible dans `loader` et les routes enfants

```tsx
beforeLoad: async ({ context }) => {
  const user = await getUser()
  if (!user) throw redirect({ to: '/login' })
  return { user }  // ajouté au contexte pour loader + enfants
}
```

### `loader` — données de la page

- S'exécute côté serveur au premier rendu (SSR)
- Résultat accessible via `Route.useLoaderData()` dans le composant

```tsx
loader: async ({ context }) => {
  // context.user est dispo grâce à beforeLoad
  return { posts: await getUserPosts(context.user.id) }
}

function Page() {
  const { posts } = Route.useLoaderData()
  return <PostList posts={posts} />
}
```

### `Route.useRouteContext()` — données SSR sans flash

```tsx
function Layout() {
  const { user } = Route.useRouteContext()
  // Pas de flash : les données viennent du serveur
  return <Sidebar user={user} />
}
```

## Layouts

### Layout avec route (crée un segment URL)

```tsx
// routes/dashboard.tsx — layout pour /dashboard/*
export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div>
      <DashboardNav />
      <Outlet /> {/* Enfants rendus ici */}
    </div>
  )
}
```

### Layout pathless (pas de segment URL)

```tsx
// routes/_auth.tsx — wraps login/register sans ajouter /auth à l'URL
export const Route = createFileRoute('/_auth')({
  component: AuthLayout,
})
```

## Règles

- **Ne jamais éditer `routeTree.gen.ts`** : il est auto-généré
- **`beforeLoad` pour l'auth** : toujours vérifier l'auth dans `beforeLoad`, pas dans le composant
- **`loader` pour les données** : charger les données dans le loader, pas dans `useEffect`
- **Route context pour l'affichage** : utiliser `Route.useRouteContext()` pour les données SSR
- **Zustand pour les mutations** : réserver Zustand aux actions client (login, logout)
