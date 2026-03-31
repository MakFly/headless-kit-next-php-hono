---
name: sf-entity
description: Create or modify a Doctrine entity in src/Shared/Entity/ with proper ORM attributes, UUID v7, lifecycle callbacks, and optional API Platform #[ApiResource]. Use when the user asks to create a new entity, add fields to an entity, or modify database structure.
argument-hint: <EntityName> [field:type...]
disable-model-invocation: true
---

# Create/Modify Doctrine Entity

Create or modify an entity in `src/Shared/Entity/`.

## Conventions

- Namespace: `App\Shared\Entity`
- ID: string UUID v7 via `Ramsey\Uuid\Uuid::uuid7()->toString()`
- All entities have `createdAt` (DateTimeImmutable) and `updatedAt` (DateTimeImmutable)
- Use `#[ORM\HasLifecycleCallbacks]` + `#[ORM\PreUpdate]` for updatedAt
- Use `declare(strict_types=1)` at the top
- Fluent setters returning `static`
- Include a `toArray(): array` method

## When adding API Platform support

Add `#[ApiResource]` with operations array. Routes use relative paths (prefix `/api/v1` applied by `config/routes/api_platform.yaml`).

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

Add `#[Groups(['resource:read'])]` on properties, NOT on getters.

## Steps

1. Create file in `src/Shared/Entity/$ARGUMENTS[0].php`
2. Add ORM mappings for requested fields
3. Add constructor with UUID v7 + timestamps
4. Add getters/setters
5. Add `toArray()` method
6. Run `php bin/console doctrine:schema:validate` to verify

Entity: $ARGUMENTS
