# Adapter Pattern

TanStack Start calls backends **directly** (no BFF proxy like Next.js). The adapter pattern is the critical architecture guardrail.

## Structure

```
src/lib/adapters/
├── index.ts           # Factory: getAuthAdapter(), getBackendType()
├── base-adapter.ts    # Abstract BaseAdapter class
├── types.ts           # AuthAdapter type, AuthResponse, NormalizedUser
├── errors.ts          # AdapterError class
├── laravel/adapter.ts # LaravelAdapter (port 8002)
├── symfony/adapter.ts # SymfonyAdapter (port 8001)
└── node/adapter.ts    # NodeAdapter (port 3333)
```

## Backend selection

`AUTH_BACKEND` env var → `getAuthAdapter()` factory returns the right adapter.

## BaseAdapter provides

- `makeRequest<T>()` — HTTP client with auth headers
- `storeTokens()` — writes HttpOnly cookies via `setCookie` from `@tanstack/react-start/server`
- `clearTokens()` — deletes auth cookies
- `getAccessToken()` / `getRefreshToken()` — reads cookies

## Critical rules

- Never call backend URLs directly — always through adapter methods
- Never use `fetch()` in components — use server functions that call adapters
- Token storage is via cookies (not localStorage)
- Each adapter has its own endpoint paths (Laravel: `/api/auth/*`, Symfony: `/auth/*`, Node: `${prefix}/*`)

## AdapterError

Typed error with `statusCode`, `code`, `message`. Always catch and handle in server functions.
