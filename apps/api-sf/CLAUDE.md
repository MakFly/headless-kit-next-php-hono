# API Symfony — Backend PHP

## Stack

- **Framework**: Symfony 8
- **Auth**: BetterAuth (betterauth/symfony-bundle) — Paseto V4 tokens
- **ORM**: Doctrine ORM (attributes)
- **CRUD layer**: API Platform 4 (34 operations across 13 resources)
- **DB**: SQLite (dev/test), PostgreSQL (prod)
- **Docs**: API Platform OpenAPI

## Architecture — Vertical Slice Architecture + API Platform hybrid

```
src/
├── Feature/
│   ├── Auth/
│   │   ├── Controller/          # 11 invokable controllers
│   │   │   ├── RegisterController.php
│   │   │   ├── LoginController.php
│   │   │   ├── Login2faController.php
│   │   │   ├── MeController.php
│   │   │   ├── RefreshController.php
│   │   │   ├── LogoutController.php
│   │   │   ├── RevokeAllController.php
│   │   │   ├── TestAccountsController.php
│   │   │   ├── ForgotPasswordController.php
│   │   │   ├── ResetPasswordController.php
│   │   │   └── VerifyResetTokenController.php
│   │   ├── DTO/
│   │   └── Service/
│   │       └── AuthService.php
│   ├── Cart/
│   │   ├── Controller/          # 4 controllers (ShowCart, AddItem, UpdateItem, RemoveItem)
│   │   └── Repository/
│   ├── Orders/
│   │   ├── Controller/          # 1 controller (CreateOrder) — List/Show via API Platform
│   │   └── Repository/
│   ├── Admin/
│   │   ├── Controller/
│   │   │   ├── Rbac/            # 6 controllers (ListRoles, AssignRole, etc.)
│   │   │   └── Shop/            # 8 controllers (Dashboard, RevenueAnalytics, TopProducts,
│   │   │                        #   Inventory, UpdateInventory, UpdateOrderStatus,
│   │   │                        #   BulkApproveReviews, BulkRejectReviews)
│   │   └── Service/
│   │       └── SegmentQueryService.php
│   ├── Saas/
│   │   ├── Controller/          # 10 controllers (Dashboard, GetSubscription, Subscribe,
│   │   │                        #   Cancel, InviteTeamMember, ChangeTeamRole, RemoveTeamMember,
│   │   │                        #   GetUsage, GetSettings, UpdateSettings)
│   │   └── Service/
│   │       └── OrgLoader.php
│   └── Support/
│       └── Controller/          # 8 controllers (CreateConversation, SendMessage, Rate,
│                                #   AgentQueue, AgentAssigned, Assign, UpdateStatus, RatingStats)
├── Shared/
│   ├── Entity/                  # ALL Doctrine entities — #[ApiResource] on CRUD entities
│   ├── Repository/              # Shared repos
│   ├── Security/                # Voters, traits
│   ├── Service/
│   │   └── ApiResponseService.php
│   ├── ApiPlatform/
│   │   ├── Serializer/          # Normalizers, EnvelopeSubscriber
│   │   ├── Doctrine/            # ORM extensions (filters, pagination)
│   │   └── State/               # Custom state providers/processors
│   └── EventSubscriber/
│       └── ApiExceptionSubscriber.php
```

## Hybrid approach: when to use API Platform vs invokable controllers

| Use API Platform | Use invokable controller |
|-----------------|--------------------------|
| CRUD (list, show, create, update, delete) | Business logic (subscribe, invite, assign) |
| Standard filtering + pagination | Multi-step operations |
| Resource serialization with Groups | Aggregations / analytics |
| Read-only public resources | Mutations with side-effects |

## Convention — Invokable controllers

Each endpoint = 1 invokable controller with `__invoke()` and `#[Route]`:

```php
<?php

declare(strict_types=1);

namespace App\Feature\Cart\Controller;

use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/cart', name: 'api_v1_cart_show', methods: ['GET'])]
class ShowCartController extends AbstractController
{
    public function __construct(
        private readonly ApiResponseService $apiResponse,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        // Implementation
        return $this->apiResponse->success($data);
    }
}
```

## Convention — API Platform resources

Routes use relative `uriTemplate` — the `/api/v1` prefix is applied by `config/routes/api_platform.yaml`.
Add `#[Groups]` on **properties**, not on getters.

```php
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/products'),
        new Get(uriTemplate: '/products/{id}'),
    ],
    normalizationContext: ['groups' => ['product:read']],
)]
#[ORM\Entity]
class Product
{
    #[Groups(['product:read'])]
    private string $name;
}
```

The `EnvelopeSubscriber` wraps all API Platform responses in the standard envelope:
`{success: bool, data: mixed, status: int, request_id: string}`

## Convention — Entity namespace

All entities live in `App\Shared\Entity\`. Doctrine mapping configured in `config/packages/doctrine.yaml`:

```yaml
doctrine:
    orm:
        mappings:
            App:
                type: attribute
                dir: '%kernel.project_dir%/src/Shared/Entity'
                prefix: 'App\Shared\Entity'
```

## Convention — BetterAuth services override

```yaml
BetterAuth\Symfony\Security\BetterAuthUserProvider:
    arguments:
        $userClass: 'App\Shared\Entity\User'

BetterAuth\Symfony\Service\UserIdConverter:
    arguments:
        $userClass: 'App\Shared\Entity\User'
```

## API Platform resources (34 operations)

| Resource | Operations |
|----------|-----------|
| Product | GetCollection, Get, Post, Patch, Delete (5) |
| Category | GetCollection, Get (2) |
| Review | GetCollection, Get, Post (3) |
| Order | GetCollection, Get (2) — read only, CreateOrder via controller |
| Plan | GetCollection, Get (2) |
| Organization | GetCollection, Get, Patch (3) |
| Subscription | Get (1) |
| Invoice | GetCollection (1) |
| TeamMember | GetCollection, Get, Patch, Delete (4) |
| UsageRecord | GetCollection (1) |
| Conversation | GetCollection, Get, Patch (3) |
| ChatMessage | GetCollection, Post (2) |
| CannedResponse | GetCollection, Get, Post, Patch, Delete (5) |

## Commands

```bash
symfony server:start --port=8001 --no-tls  # Dev server
php bin/phpunit                             # Run all tests (129)
php bin/phpunit tests/Functional/Auth/      # Auth tests only
php bin/phpunit --filter=testListProducts   # Specific test
php bin/console cache:clear                 # Clear cache
php bin/console doctrine:migrations:migrate # Run migrations
php bin/console doctrine:schema:validate    # Validate schema
```

## Feature slices

| Feature | Prefix | Firewall | Controllers |
|---------|--------|----------|-------------|
| Auth | `/api/v1/auth` | public | 11 invokable controllers |
| Shop | `/api/v1` | public | 0 controllers (API Platform only) |
| Cart | `/api/v1/cart` | authenticated | 4 controllers |
| Orders | `/api/v1/orders` | authenticated | 1 controller + 2 AP ops |
| Admin/Rbac | `/api/v1/admin` | authenticated+ROLE_ADMIN | 6 controllers |
| Admin/Shop | `/api/v1/admin` | authenticated+ROLE_ADMIN | 8 controllers |
| Saas | `/api/v1/saas` | authenticated | 10 controllers |
| Support | `/api/v1/support` | authenticated | 8 controllers |

## Key config files

- `config/packages/security.yaml` — Firewalls, user provider (`App\Shared\Entity\User`)
- `config/packages/doctrine.yaml` — Entity mapping (`src/Shared/Entity/`)
- `config/packages/better_auth.yaml` — BetterAuth (Paseto V4, 2FA, magic link)
- `config/packages/api_platform.yaml` — API Platform (formats, pagination, serializer groups)
- `config/routes/api_platform.yaml` — Mounts API Platform under `/api/v1` prefix
- `config/services.yaml` — Auto-wiring + BetterAuth service overrides

## Security

- **Tokens**: Paseto V4 (not JWT) — cryptographically secure
- **Firewalls**: Public auth routes, protected API routes (IS_AUTHENTICATED_FULLY)
- **Password**: Argon2id (auto)
- **CORS**: Nelmio CORS for frontend origin
- **Refresh token**: Body expects `refreshToken` (camelCase)

## Response format

All responses (both invokable controllers and API Platform) use the same envelope:

```json
{
  "success": true,
  "data": { ... },
  "status": 200,
  "request_id": "abc123"
}
```

Collections also include: `"meta": { "page": 1, "per_page": 20, "total": 100, "last_page": 5 }`

Error: `{ "success": false, "error": { "code": "...", "message": "..." }, "status": 500 }`
