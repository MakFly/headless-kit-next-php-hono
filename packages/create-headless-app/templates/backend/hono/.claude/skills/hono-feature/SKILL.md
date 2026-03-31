---
name: hono-feature
description: Create a new feature slice in src/features/ with all 5 convention files (routes, handlers, service, repository, schemas). Use when the user asks to add a new feature module or endpoint group.
argument-hint: <feature-name>
disable-model-invocation: true
---

# Create Hono Feature Slice

Create a new feature in `src/features/$ARGUMENTS/`.

## Architecture

Each feature has exactly 5 files:

```
src/features/{name}/
├── {name}.routes.ts       # Hono route definitions + middleware
├── {name}.handlers.ts     # Thin: parse request → call service → return response
├── {name}.service.ts      # Business logic
├── {name}.repository.ts   # Database queries via Drizzle ORM
└── {name}.schemas.ts      # Zod validation schemas
```

## File Templates

### routes.ts
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../../shared/middleware/auth.ts';
import * as handlers from './{name}.handlers.ts';
import { createSchema } from './{name}.schemas.ts';

const app = new Hono();

app.get('/', handlers.list);
app.get('/:id', handlers.getById);
app.post('/', authMiddleware, zValidator('json', createSchema), handlers.create);

export default app;
```

### handlers.ts
```typescript
import type { Context } from 'hono';
import * as service from './{name}.service.ts';
import { apiSuccess, apiError } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

export const list = async (c: Context<{ Variables: AppVariables }>) => {
  const result = await service.list();
  return apiSuccess(c, result);
};

export const getById = async (c: Context<{ Variables: AppVariables }>) => {
  const id = c.req.param('id');
  const result = await service.getById(id);
  if (!result) return apiError(c, 'NOT_FOUND', 'Not found', 404);
  return apiSuccess(c, result);
};

export const create = async (c: Context<{ Variables: AppVariables }>) => {
  const body = c.req.valid('json');
  const result = await service.create(body);
  return apiSuccess(c, result, undefined, 201);
};
```

### service.ts
```typescript
import * as repository from './{name}.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

export const list = async () => {
  return repository.findAll();
};

export const getById = async (id: string) => {
  return repository.findById(id);
};

export const create = async (data: { name: string }) => {
  return repository.create(data);
};
```

### repository.ts
```typescript
import { db, schema } from '../../shared/db/index.ts';
import { eq, desc } from 'drizzle-orm';

export const findAll = async () => {
  return db.select().from(schema.{tableName}).orderBy(desc(schema.{tableName}.createdAt));
};

export const findById = async (id: string) => {
  return db.query.{tableName}.findFirst({ where: eq(schema.{tableName}.id, id) });
};

export const create = async (data: { name: string }) => {
  const id = crypto.randomUUID();
  const [row] = await db.insert(schema.{tableName}).values({ id, ...data }).returning();
  return row;
};
```

### schemas.ts
```typescript
import { z } from 'zod';

export const createSchema = z.object({
  name: z.string().min(1).max(255),
});

export type CreateInput = z.infer<typeof createSchema>;

export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
```

## Steps

1. Create all 5 files in `src/features/$ARGUMENTS/`
2. Mount in `src/index.ts`:
   ```typescript
   import {name}Routes from './features/{name}/{name}.routes.ts';
   app.route(`/api/${apiVersion}/{name}`, {name}Routes);
   ```
3. If a DB table is needed, add to `src/shared/db/schema.ts` and run `bun run db:generate && bun run db:migrate`
4. Add seeders in `src/shared/db/seeders/` if needed
5. Run `bun run typecheck` to verify

Feature: $ARGUMENTS
