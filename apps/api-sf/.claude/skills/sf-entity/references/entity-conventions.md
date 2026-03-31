# Doctrine entity conventions

- Namespace: `App\Shared\Entity`
- ID: string UUID v7 — `Ramsey\Uuid\Uuid::uuid7()->toString()`
- `createdAt` / `updatedAt` as `DateTimeImmutable`
- `#[ORM\HasLifecycleCallbacks]` + `#[ORM\PreUpdate]` on `updatedAt`
- `declare(strict_types=1)`; fluent setters returning `static`; `toArray(): array`

## Optional API Platform

```php
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/resource-name'),
        new Get(uriTemplate: '/resource-name/{id}'),
    ],
    normalizationContext: ['groups' => ['resource:read']],
)]
```

`#[Groups(['resource:read'])]` on properties only.

## Steps

1. `src/Shared/Entity/{Name}.php`
2. ORM fields, constructor, getters/setters, `toArray()`
3. `php bin/console doctrine:schema:validate`
