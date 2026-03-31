---
name: sf-endpoint
description: Add a single invokable controller to an existing Symfony feature. Use when adding one endpoint, not a full feature slice.
argument-hint: <Feature/EndpointName>
disable-model-invocation: true
---

# Add Symfony Endpoint

Add a single invokable controller to an existing feature in `src/Feature/`.

## Convention

Each endpoint = 1 invokable controller with `#[Route]`:

```php
<?php

declare(strict_types=1);

namespace App\Feature\{Feature}\Controller;

use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/{feature}/{action}', name: 'api_v1_{feature}_{action}', methods: ['POST'])]
class {ActionName}Controller extends AbstractController
{
    public function __construct(
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        // Implementation
        return $this->api->success($data);
    }
}
```

## Steps

1. Create controller in `src/Feature/{Feature}/Controller/{ActionName}Controller.php`
2. Use `ApiResponseService` for ALL responses (never `$this->json()`)
3. Use readonly constructor injection
4. Add `declare(strict_types=1)` at top
5. Run `php bin/console cache:clear`
6. Run `php bin/console debug:router | grep {route_name}` to verify route registration
7. Add a test in `tests/Functional/{Feature}/` if appropriate

## Decision: Controller vs API Platform

Use this skill for:
- Business logic endpoints (subscribe, invite, assign)
- Multi-step operations
- Aggregations / analytics / dashboards
- Custom response shapes

Use `sf-api-platform-resource` skill instead for:
- Standard CRUD (list, show, create, update, delete)
- Simple filtering + pagination

Target: $ARGUMENTS
