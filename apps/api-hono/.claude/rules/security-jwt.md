---
paths:
  - "apps/api-hono/**/*"
---

# JWT Security

## Algorithm

HS256 via `jose` library. Symmetric — the same secret signs and verifies.

## Secret Requirements

- Minimum 32 characters in production
- Validated at startup in `src/shared/lib/jwt.ts` — server crashes if secret is missing or placeholder
- Never log the JWT_SECRET value
- Never expose tokens in error messages or logs

## Token Lifetimes

| Token | Default TTL | Env var | Storage |
|-------|------------|---------|---------|
| Access token | 1 hour (3600s) | `JWT_ACCESS_EXPIRES_IN` | Client-side (cookie via BFF) |
| Refresh token | 7 days (604800s) | `JWT_REFRESH_EXPIRES_IN` | Database (`sessions` table) |
| 2FA temp token | 10 minutes | hardcoded | In-memory (service) |
| Password reset | 1 hour | hardcoded | Database (`password_reset_tokens`) |

## Token Verification

`verifyToken()` returns `null` on failure — it does NOT throw. Always check the return value:

```typescript
const payload = await verifyToken(token);
if (!payload) {
  return apiError(c, 'UNAUTHORIZED', 'auth.invalid_token', 401);
}
```

## Refresh Token Flow

1. Client sends refresh token in body (not header)
2. Service looks up token in `sessions` table
3. Verifies JWT signature AND database existence
4. Issues new access + refresh tokens
5. Deletes old refresh token (rotation)

## Revocation

- `POST /logout` — deletes the user's current session
- `POST /revoke-all` — deletes all user sessions
- Refresh tokens in DB allow server-side revocation
