# Rate Limiting Policy

## Standard Limits

| Endpoint type | Max requests | Window | Applies to |
|---------------|-------------|--------|------------|
| Login / Register | 5 | 15 min | IP + identifier |
| Password reset (forgot) | 3 | 15 min | IP |
| 2FA verify | 10 | 15 min | IP + user |
| 2FA recovery | 5 | 15 min | IP + user |
| Token refresh | 30 | 1 min | IP |
| API mutations (POST/PUT/DELETE) | 60 | 1 min | Authenticated user |
| API reads (GET) | 120 | 1 min | Authenticated user |

## Implementation per backend

| Backend | Mechanism | Location |
|---------|-----------|----------|
| Symfony | `RateLimiterService` (cache-backed) | `src/Feature/Auth/Service/RateLimiterService.php` |
| Laravel | `throttle` middleware | Route definition: `->middleware('throttle:5,15')` |
| Hono | `rateLimitMiddleware()` | Route file: `rateLimitMiddleware({ scope, maxAttempts, windowSeconds })` |

## When to add rate limiting

- Every auth-related endpoint (login, register, forgot-password, 2FA)
- Every endpoint that creates resources (orders, conversations, reviews)
- Every endpoint that sends notifications (invites, emails)

## When NOT to rate limit

- Health check endpoints
- Public read endpoints with proper caching
- Internal BFF-to-backend calls (already rate-limited at the BFF layer)
