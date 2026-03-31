# Feature slice — five-file templates

## routes.ts

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

## handlers.ts

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

## service.ts

```typescript
import * as repository from './{name}.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

export const list = async () => repository.findAll();
export const getById = async (id: string) => repository.findById(id);
export const create = async (data: { name: string }) => repository.create(data);
```

## repository.ts (adapt table names)

```typescript
import { db, schema } from '../../shared/db/index.ts';
import { eq, desc } from 'drizzle-orm';

export const findAll = async () => {
  return db.select().from(schema.tableName).orderBy(desc(schema.tableName.createdAt));
};

export const findById = async (id: string) => {
  return db.query.tableName.findFirst({ where: eq(schema.tableName.id, id) });
};

export const create = async (data: { name: string }) => {
  const id = crypto.randomUUID();
  const [row] = await db.insert(schema.tableName).values({ id, ...data }).returning();
  return row;
};
```

## schemas.ts

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

## Mount in `src/index.ts`

```typescript
import nameRoutes from './features/{name}/{name}.routes.ts';
app.route(`/api/${apiVersion}/{name}`, nameRoutes);
```

If new tables: edit `src/shared/db/schema.ts`, then `bun run db:generate && bun run db:migrate`.
