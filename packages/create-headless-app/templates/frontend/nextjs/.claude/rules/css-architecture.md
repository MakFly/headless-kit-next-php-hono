# CSS Architecture — Next.js BFF

## Le découpage : 4 fichiers, jamais plus dans l'entry

```
src/
├─ app/globals.css          # entry — imports + @theme inline + @layer base
└─ styles/
   ├─ theme.css             # design tokens (CSS vars, oklch, light/dark)
   ├─ utilities.css         # @layer utilities pures
   └─ animations.css        # @keyframes + .animate-* utilities
```

`globals.css` est importé une seule fois depuis `src/app/layout.tsx`. Aucun autre `.css` n'est importé depuis un composant — sauf les CSS tiers indispensables (`@assistant-ui/react-markdown/styles/dot.css` par ex).

## J'ajoute quoi où ?

| Je veux ajouter… | Va dans… |
|---|---|
| Une couleur / radius / espacement réutilisable | `theme.css` (poser la var) **+** `globals.css` (mapper via `@theme inline { --color-X: var(--X) }` si Tailwind doit l'exposer) |
| Une classe utilitaire qui réfère un token (`.text-foo`, `.bg-bar`) | `utilities.css` |
| Une `@keyframes` + sa classe `.animate-*` | `animations.css` |
| Un reset HTML global (1-2 lignes) | `@layer base` dans `globals.css` |
| Un style scoped à 1 composant | **Pas de CSS** — Tailwind classes inline dans le `.tsx` |
| Un pattern récurrent multi-composants (ex: glassmorphism) | Utility dans `utilities.css`, ou composant React partagé |
| Polices custom | `@import` Fontsource dans `globals.css`, `--font-sans` token dans `theme.css` |

## Anti-patterns interdits

- ❌ `oklch(...)` ou autre couleur hardcodée hors de `theme.css`
- ❌ `@theme inline` ailleurs que dans `globals.css`
- ❌ `@keyframes` ailleurs que dans `animations.css`
- ❌ Sélecteurs raw (sans `@layer utilities`) dans `utilities.css` ou `animations.css`
- ❌ Fichiers `*.module.css`, `<style jsx>`, `styled-components`, `emotion`
- ❌ Tailwind v3 directives (`@tailwind base/components/utilities`) — on est en v4

## Convention en bref

> Si tu hésites entre `globals.css` et un autre fichier, c'est presque toujours **un autre fichier**. `globals.css` ne contient que des `@import`, le `@theme inline`, et le `@layer base` (resets globaux 2-5 lignes max).
