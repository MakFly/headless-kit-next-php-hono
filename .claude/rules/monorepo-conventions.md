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
| Next.js BFF | 3300 |
| TanStack Start | 3301 |
| Laravel API | 8002 |
| Symfony API | 8001 |
| Hono API | 3333 |

## Naming conventions (.claude/)

### Agents

- Implementation : `backend-{stack}` ou `frontend-{stack}` (ex: `backend-symfony`, `frontend-next`)
- Review : `{app}-reviewer` (ex: `sf-reviewer`, `hono-reviewer`)
- Model : `sonnet` pour implémentation, `opus` pour review/raisonnement complexe

### Skills

- Prefix par app : `sf-`, `hono-`, `lara-`, `next-`, `ts-` (TanStack)
- Format : `{prefix}-{operation}` (ex: `sf-feature`, `hono-endpoint`, `next-page`)
- Chaque skill a un `SKILL.md` avec frontmatter YAML (`name`, `description`, `allowed-tools`)

### Rules

- Un fichier = un concern (pas de fichier fourre-tout)
- Ne pas dupliquer le contenu du `CLAUDE.md` de l'app
- Focus sur les pitfalls et guardrails que le LLM oublie

## Commits

Conventional Commits en anglais : `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`.
