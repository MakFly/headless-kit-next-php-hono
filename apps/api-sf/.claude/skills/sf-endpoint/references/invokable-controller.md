# Invokable Symfony controller — template

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
        return $this->api->success($data);
    }
}
```

## Steps

1. `src/Feature/{Feature}/Controller/{ActionName}Controller.php`
2. Use **only** `ApiResponseService` for JSON (not `$this->json()`)
3. `declare(strict_types=1)`; readonly constructor injection
4. `php bin/console cache:clear`
5. `php bin/console debug:router | grep {route_name}`
6. Add `tests/Functional/{Feature}/` when needed

## Controller vs API Platform

| Use controller | Use API Platform |
|----------------|------------------|
| Subscribe, invite, assign, multi-step | List/show/create/update/delete CRUD |
| Aggregations, dashboards | Filtering + pagination only |
