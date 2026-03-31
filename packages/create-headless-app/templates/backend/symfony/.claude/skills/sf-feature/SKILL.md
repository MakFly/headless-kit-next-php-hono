---
name: sf-feature
description: Create a new feature slice in src/Feature/ with invokable controllers, following Vertical Slice Architecture. Use when the user asks to add a new feature, module, or endpoint group.
argument-hint: <FeatureName>
disable-model-invocation: true
---

# Create Feature Slice

Create a new feature in `src/Feature/$ARGUMENTS/`.

## Architecture

Each feature is a self-contained vertical slice:

```
src/Feature/{Name}/
├── Controller/          # Invokable controllers (1 per endpoint)
├── Repository/          # Doctrine repositories (optional)
├── Service/             # Business logic (optional)
└── DTO/                 # Request DTOs with #[MapRequestPayload] (optional)
```

## Controller Convention

Each endpoint = 1 invokable controller:

```php
<?php

declare(strict_types=1);

namespace App\Feature\{Name}\Controller;

use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/{prefix}/{action}', name: 'api_v1_{prefix}_{action}', methods: ['GET'])]
class ListItemsController extends AbstractController
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

## Steps

1. Create directory `src/Feature/$ARGUMENTS/Controller/`
2. Create invokable controllers for each endpoint
3. Use `ApiResponseService` for all responses
4. Use entities from `App\Shared\Entity\`
5. Auto-discovery via services.yaml (no manual registration needed)
6. Run `php bin/console cache:clear` to verify

Feature: $ARGUMENTS
