# Bun tests — integration + unit

## Integration (`src/tests/integration/{feature}/`)

Use `app.request()` on the root `app` from `src/index.ts`.

```typescript
import { describe, expect, it, beforeAll } from 'bun:test';
import app from '../../../index.ts';

describe('Feature API', () => {
  let token: string;

  beforeAll(async () => {
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Test User',
      }),
    });
    const data = (await res.json()) as { data: { accessToken: string } };
    token = data.data.accessToken;
  });

  it('GET returns envelope', async () => {
    const res = await app.request('/api/v1/feature', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: unknown };
    expect(body.success).toBe(true);
  });
});
```

## Envelope assertions

Success: `{ success: true, data, status, request_id, meta? }`  
Error: `{ success: false, error: { code, message, details? }, status, request_id }`

## Unit (`src/tests/unit/`)

Pure functions / helpers — no full app import unless needed.

## Commands

```bash
bun test
bun test src/tests/unit/
bun test src/tests/integration/
bun test --grep "pattern"
```
