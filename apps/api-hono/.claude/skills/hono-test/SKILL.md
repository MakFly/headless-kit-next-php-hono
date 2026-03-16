---
name: hono-test
description: Write integration or unit tests using Bun test runner. Use when the user asks to test a feature or endpoint.
argument-hint: <feature-name>
disable-model-invocation: true
---

# Write Hono Tests

## File Placement

- Integration tests: `src/tests/integration/{feature}/{feature}.test.ts`
- Unit tests: `src/tests/unit/{name}.test.ts`
- Test setup: `src/tests/setup.ts`
- Test helpers: `src/tests/helpers/test-app.ts`

## Integration Test Convention

Use `app.request()` directly (no supertest needed — Bun native).

```typescript
// src/tests/integration/{feature}/{feature}.test.ts
import { describe, expect, it, beforeAll } from 'bun:test';
import app from '../../../index.ts';

describe('{Feature} API', () => {
  let token: string;

  beforeAll(async () => {
    // Register a test user and capture the token
    const res = await app.request('/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: `test-{feature}-${Date.now()}@example.com`,
        password: 'SecurePass123!',
        name: 'Test User',
      }),
    });
    const data = (await res.json()) as { data: { accessToken: string } };
    token = data.data.accessToken;
  });

  it('GET /api/v1/{feature} — returns 200 with data envelope', async () => {
    const res = await app.request('/api/v1/{feature}', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { success: boolean; data: unknown };
    expect(body.success).toBe(true);
    expect(body.data).toBeDefined();
  });

  it('POST /api/v1/{feature} — creates resource', async () => {
    const res = await app.request('/api/v1/{feature}', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Test Item' }),
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { success: boolean; data: { id: string } };
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
  });

  it('GET /api/v1/{feature}/unknown — returns 404', async () => {
    const res = await app.request('/api/v1/{feature}/unknown-id', {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { success: boolean };
    expect(body.success).toBe(false);
  });
});
```

## Unit Test Convention

```typescript
// src/tests/unit/{name}.test.ts
import { describe, expect, it } from 'bun:test';

describe('{Name}', () => {
  it('should handle valid input', () => {
    // test body
    expect(true).toBe(true);
  });

  it('should throw on invalid input', () => {
    expect(() => { throw new Error('invalid'); }).toThrow('invalid');
  });
});
```

## Response Envelope

All responses follow this shape — assert against it:

```typescript
// Success
{ success: true, data: unknown, status: number, request_id: string, meta?: object }

// Error
{ success: false, error: { code: string, message: string, details?: unknown }, status: number, request_id: string }
```

## Run Commands

```bash
bun test                                          # All tests
bun test src/tests/unit/                          # Unit tests only
bun test src/tests/integration/                   # All integration tests
bun test src/tests/integration/{feature}/         # Single feature
bun test --grep "{pattern}"                       # Filter by name
```

Target: $ARGUMENTS
