<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/saas/plans'),
        new Get(uriTemplate: '/saas/plans/{id}'),
    ],
    normalizationContext: ['groups' => ['plan:read']],
)]
#[ORM\Entity]
#[ORM\Table(name: 'plans')]
#[ORM\HasLifecycleCallbacks]
class Plan
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['plan:read'])]
    private string $id;

    #[ORM\Column(type: 'string')]
    #[Groups(['plan:read'])]
    private string $name;

    #[ORM\Column(type: 'string', unique: true)]
    #[Groups(['plan:read'])]
    private string $slug;

    #[ORM\Column(type: 'integer')]
    #[Groups(['plan:read'])]
    private int $priceMonthly;

    #[ORM\Column(type: 'integer')]
    #[Groups(['plan:read'])]
    private int $priceYearly;

    #[ORM\Column(type: 'json')]
    #[Groups(['plan:read'])]
    private array $features = [];

    /** @var array{maxMembers: int, maxProjects: int, maxStorage: int, apiCallsPerMonth: int}|array<never, never> */
    #[ORM\Column(type: 'json')]
    #[Groups(['plan:read'])]
    private array $limits = [];

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['plan:read'])]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['plan:read'])]
    private DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = new DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new DateTimeImmutable();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getSlug(): string
    {
        return $this->slug;
    }

    public function setSlug(string $slug): static
    {
        $this->slug = $slug;

        return $this;
    }

    public function getPriceMonthly(): int
    {
        return $this->priceMonthly;
    }

    public function setPriceMonthly(int $priceMonthly): static
    {
        $this->priceMonthly = $priceMonthly;

        return $this;
    }

    public function getPriceYearly(): int
    {
        return $this->priceYearly;
    }

    public function setPriceYearly(int $priceYearly): static
    {
        $this->priceYearly = $priceYearly;

        return $this;
    }

    public function getFeatures(): array
    {
        return $this->features;
    }

    public function setFeatures(array $features): static
    {
        $this->features = $features;

        return $this;
    }

    public function getLimits(): array
    {
        return $this->limits;
    }

    public function setLimits(array $limits): static
    {
        $this->limits = $limits;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'priceMonthly' => $this->priceMonthly,
            'priceYearly' => $this->priceYearly,
            'features' => $this->features,
            'limits' => $this->limits,
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
            'updatedAt' => $this->updatedAt->format(DateTimeInterface::ATOM),
        ];
    }
}
