# Stratégie Data Fetching : Server Actions vs TanStack Query

## Règle par défaut : Server Actions seuls

Pour 80% des cas, **Server Actions + RSC suffisent**. Ne pas ajouter TanStack Query par défaut.

## Matrice de décision

| Cas d'usage | Solution | Pourquoi |
|-------------|----------|----------|
| Fetch au chargement d'une page | RSC + Server Action | Pas de JS client, SEO optimal |
| Mutation simple (form, delete) | Server Action + `useActionState` | Natif React 19, progressif |
| Auth (login/logout/register) | Server Action + Zustand | État UI partagé (isLoading, user) |
| Liste avec filtres/tri côté client | **TanStack Query** | Cache, invalidation automatique |
| Données partagées entre composants | **TanStack Query** | Cache global évite prop drilling |
| Optimistic updates | **TanStack Query** | `useMutation` avec `onMutate` |
| Polling / real-time | **TanStack Query** | `refetchInterval` intégré |

## Pattern : RSC + Server Action (par défaut)

```tsx
// app/users/page.tsx (Server Component)
export default async function UsersPage() {
  const users = await getUsersAction();
  return <UsersTable users={users} />;
}
```

## Pattern : Server Action + useActionState (mutations)

```tsx
'use client';
import { useActionState } from 'react';
import { deleteUserAction } from '@/lib/actions/rbac';

function DeleteButton({ userId }: { userId: number }) {
  const [state, action, isPending] = useActionState(
    () => deleteUserAction(userId),
    null
  );

  return (
    <form action={action}>
      <button disabled={isPending}>
        {isPending ? 'Suppression...' : 'Supprimer'}
      </button>
    </form>
  );
}
```

## Pattern : TanStack Query (quand nécessaire)

Utiliser UNIQUEMENT si :
- ✅ Filtres/pagination côté client avec cache
- ✅ Même données dans plusieurs composants
- ✅ Optimistic updates critiques pour l'UX
- ✅ Polling requis

```tsx
'use client';
import { usePosts, useDeletePost } from '@/lib/query';

function PostsManager() {
  const { data: posts, isLoading } = usePosts();
  const { mutate: deletePost, isPending } = useDeletePost();

  // Cache partagé, optimistic possible
}
```

## Où se trouve TanStack Query ?

Le setup existe dans `lib/query/` mais n'est PAS obligatoire :
- `WithQuery` wrapper pour activer TanStack Query sur une page spécifique
- Hooks disponibles pour les cas complexes uniquement

### Activer TanStack Query sur une page

```tsx
// app/admin/posts/page.tsx
import { WithQuery } from '@/lib/query';
import { PostsManager } from './posts-manager';

export default function PostsPage() {
  return (
    <WithQuery>
      <PostsManager />
    </WithQuery>
  );
}
```

## Anti-patterns à éviter

❌ Utiliser TanStack Query pour un simple fetch au chargement
❌ Dupliquer l'état (Zustand + TanStack Query pour les mêmes données)
❌ useQuery dans un composant qui pourrait être RSC
❌ Ajouter QueryProvider globalement "au cas où"
