# Next.js BFF (`apps/web`)

## Stack

| | Version |
|-|---------|
| Next.js | 16.1.6 (App Router) |
| React | 19.2.4 |
| TypeScript | 5.7+ |
| Tailwind CSS | 4.2+ |
| shadcn/ui | latest (Radix UI primitives) |
| Zustand | 5.0 |
| TanStack Query | 5.90 (opt-in only) |
| TanStack Table | 8.21 |
| Vercel AI SDK | 6.0 |
| assistant-ui | 0.12 |
| Recharts | 2.15 |
| next-themes | 0.4 |
| Pino | 10.3 |
| Zod | 4.3 |

## Architecture

```
Browser
  │
  ├─ Page navigation → Next.js App Router (SSR / RSC)
  │                         │
  │                         └─ Server Action → BFF client → /api/v1/* → Backend
  │
  └─ Client fetch → /api/v1/* (catch-all route handler)
                         │
                         ├─ Laravel  (port 8002)
                         ├─ Symfony  (port 8001)
                         └─ Hono     (port 3333)
```

**The frontend never contacts backends directly.** All traffic goes through the BFF proxy at `/api/v1/*`.

## Detail

Directory layout, BFF route flow, auth, token refresh, middleware, data fetching, env vars, AI, CSS conventions, rules index, and skills: @.claude/web-bff-reference.md
