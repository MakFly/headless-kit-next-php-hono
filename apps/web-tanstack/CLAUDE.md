# Web Tanstack - Règles de développement

## CSS Architecture (Tailwind v4)

4 fichiers, jamais plus dans l'entry :

| File | Purpose |
|------|---------|
| `src/styles.css` | Entry — `@import` tailwind/fonts/theme/utilities/animations, `@theme inline`, `@layer base` (resets 2-5 lignes) |
| `src/styles/theme.css` | Design tokens — `:root` / `.dark` / `:root:not(.dark)` CSS vars (oklch + neon) |
| `src/styles/utilities.css` | `@layer utilities` qui réfèrent toujours `var(--token)` |
| `src/styles/animations.css` | `@keyframes` + `.animate-*` utilities |

Convention complète + tableau « j'ajoute quoi où » + anti-patterns : `.claude/rules/css-architecture.md`.

Linter local : `bun run check:css` (CI le lance aussi).

## Authentification & État

### Contexte Route vs Zustand

**Problème de flash UI** : L'utilisation directe de Zustand (`useAuthStore`) côté client cause un flash car le store doit s'hydrater côté client après le rendu serveur.

**Solution recommandée** :

1. **Données SSR (lecture seule)** : Utiliser le contexte route (`Route.useRouteContext()`) pour éviter le flash
2. **Zustand** : Utiliser pour les mutations client (login, logout, mise à jour user) et synchronisation

```tsx
// ✅ Bon : Contexte route pour l'affichage (pas de flash)
function DashboardLayout() {
  const context = Route.useRouteContext()
  return <AppLayout user={context.user ?? null} />
}

// ✅ Bon : Zustand pour les actions
const { login } = useAuthStore()

// ✅ Hydrater le store côté client
useEffect(() => {
  hydrate(context.user)
}, [context.user])
```

### Règles

- **Sidebar, Header, Layout** : Toujours utiliser `Route.useRouteContext()` pour afficher les données utilisateur
- **Actions (login, logout, form submissions)** : Utiliser Zustand (`useAuthStore`)
- **Avant de rendre un composant qui dépend du user** : S'assurer que les données viennent du contexte route, pas directement du store

## Skills

Sous `.claude/skills/` : `ts-component`, `ts-page`, `ts-server-fn`, `ts-service`. Chaque skill a un dossier `references/` — suivre les imports `@…` dans le `SKILL.md` pour le détail et les pointeurs vers le code.
