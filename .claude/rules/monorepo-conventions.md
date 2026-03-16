# Monorepo Conventions

## Package Manager

**bun** uniquement. Jamais npm/npx/yarn.

```bash
bun install              # pas npm install
bunx create-xxx          # pas npx
bun add package          # pas npm install package
bun add -d package       # devDependency
bun run script           # pas npm run
```

## Turborepo

Utiliser les filtres turbo pour cibler une app :

```bash
bun run --filter @headless/web dev
bun run --filter @headless/api-hono dev
```

## Workspace References

Les packages internes utilisent `workspace:*` :

```json
{
  "dependencies": {
    "@headless/types": "workspace:*"
  }
}
```

## Ports

| App | Port |
|-----|------|
| Next.js BFF | 3001 |
| TanStack Start | 3003 |
| Laravel API | 8000 |
| Symfony API | 8002 |
| Hono API | 8003 |

## Commits

Conventional Commits en anglais : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
