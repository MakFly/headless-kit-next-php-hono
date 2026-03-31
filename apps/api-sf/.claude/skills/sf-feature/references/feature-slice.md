# Symfony feature slice

```
src/Feature/{Name}/
├── Controller/     # Invokable (1 per endpoint)
├── Repository/     # Optional
├── Service/        # Optional
└── DTO/            # #[MapRequestPayload] optional
```

## Controller sketch

```php
#[Route('/api/v1/{prefix}/...', name: 'api_v1_...', methods: ['GET'])]
class ListItemsController extends AbstractController
{
    public function __construct(
        private readonly ApiResponseService $apiResponse,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        return $this->apiResponse->success($data);
    }
}
```

## Steps

1. `src/Feature/{Name}/Controller/`
2. Invokable controllers per endpoint; `ApiResponseService` everywhere
3. Entities: `App\Shared\Entity\`
4. Auto-wiring — no manual service registration for controllers
5. `php bin/console cache:clear`
