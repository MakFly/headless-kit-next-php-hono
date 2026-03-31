# API Security Checklist

## Object-Level Authorization (OWASP API1)

Always verify the authenticated user owns the resource before returning or modifying it.

```php
// Symfony — use Voters or manual check
if ($order->getUser() !== $this->getUser()) {
    throw $this->createAccessDeniedException();
}
```

```php
// Laravel — scope queries to authenticated user
$order = Order::where('user_id', auth()->id())->findOrFail($id);
```

```typescript
// Hono — filter in repository
const order = await repo.findByIdAndUser(orderId, user.id);
if (!order) throw new AppError('NOT_FOUND', 'order.not_found', 404);
```

## Mass Assignment Protection (OWASP API3)

Never pass raw request data to create/update without filtering.

| Backend | Mechanism | Rule |
|---------|-----------|------|
| Symfony | `#[Groups]` on properties | Only grouped properties are deserialized |
| Laravel | `$fillable` on Model | Always declare `$fillable`, never use `$guarded = []` |
| Hono | Zod `.pick()` / explicit schema | Validate with Zod before passing to repository |

## Function-Level Authorization (OWASP API5)

Every endpoint must have explicit auth middleware:

| Access level | Symfony | Laravel | Hono |
|-------------|---------|---------|------|
| Public | `security: false` in firewall | No middleware | No middleware |
| Authenticated | `IS_AUTHENTICATED_FULLY` | `auth:betterauth` | `authMiddleware` |
| Admin | `ROLE_ADMIN` via voter | `role:admin` | `adminMiddleware` |
| Org member | `OrgVoter` | `org.rbac` | `orgRbacMiddleware` |

## SSRF Prevention (OWASP API7)

Never fetch a URL provided by user input without validation. If an endpoint must fetch external URLs:
- Validate against an allowlist of domains
- Never follow redirects blindly
- Set strict timeouts

## Secrets in Responses

Never expose: passwords, tokens, internal IDs, stack traces, SQL queries.
Always use serialization groups (SF), `$hidden` (Laravel), or Zod output schemas (Hono).
