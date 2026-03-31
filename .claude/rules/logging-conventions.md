---
paths:
  - "apps/**/*"
---

# Logging Conventions

## Format

- **Production**: Structured JSON (machine-parseable)
- **Development**: Human-readable console output

## Log Levels

| Level | When | Examples |
|-------|------|---------|
| ERROR | Unhandled exceptions, 500s | DB connection failure, uncaught exception |
| WARN | Business rule violations, 4xx worth noting | Rate limit hit, failed login attempt |
| INFO | Significant events | User registered, order created, payment processed |
| DEBUG | Dev-only detail | SQL queries, request/response bodies |

## Mandatory Fields

Every log entry should include:
- `request_id` — for tracing across services
- `timestamp` — ISO 8601
- `level` — ERROR/WARN/INFO/DEBUG
- `message` — human-readable description

## Never Log

- Passwords (plaintext or hashed)
- Auth tokens (access, refresh, Paseto)
- Credit card numbers
- Full request bodies containing sensitive fields

Safe to log: user IDs, email addresses, endpoint paths, status codes, durations.

## Implementation

| Backend | Logger | Config |
|---------|--------|--------|
| Symfony | Monolog | `config/packages/monolog.yaml` |
| Laravel | Laravel Log (Monolog) | `config/logging.php` |
| Hono | Hono `logger()` middleware + `console.error` | `src/index.ts` global middleware |

## Request ID

All 3 backends generate or forward a `X-Request-Id` header:
- Set in middleware (Hono: `requestContextMiddleware`, Laravel: `ApiSecurityHeadersMiddleware`, Symfony: `SecurityHeadersSubscriber`)
- Include in every log entry and every API response
