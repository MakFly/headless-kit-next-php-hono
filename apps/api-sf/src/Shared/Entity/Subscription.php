<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new Get(uriTemplate: '/saas/organizations/{organizationId}/subscription', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
    ],
    normalizationContext: ['groups' => ['subscription:read']],
)]
#[ORM\Entity]
#[ORM\Table(name: 'subscriptions')]
class Subscription
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['subscription:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Organization::class, inversedBy: 'subscriptions')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\ManyToOne(targetEntity: Plan::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['subscription:read'])]
    private Plan $plan;

    /** active | cancelled | past_due | trialing */
    #[ORM\Column(type: 'string')]
    #[Groups(['subscription:read'])]
    private string $status = 'active';

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['subscription:read'])]
    private DateTimeImmutable $currentPeriodStart;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['subscription:read'])]
    private ?DateTimeImmutable $currentPeriodEnd = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['subscription:read'])]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->currentPeriodStart = new DateTimeImmutable();
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getOrganization(): Organization
    {
        return $this->organization;
    }

    public function setOrganization(Organization $organization): static
    {
        $this->organization = $organization;

        return $this;
    }

    public function getPlan(): Plan
    {
        return $this->plan;
    }

    public function setPlan(Plan $plan): static
    {
        $this->plan = $plan;

        return $this;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getCurrentPeriodStart(): DateTimeImmutable
    {
        return $this->currentPeriodStart;
    }

    public function setCurrentPeriodStart(DateTimeImmutable $start): static
    {
        $this->currentPeriodStart = $start;

        return $this;
    }

    public function getCurrentPeriodEnd(): ?DateTimeImmutable
    {
        return $this->currentPeriodEnd;
    }

    public function setCurrentPeriodEnd(?DateTimeImmutable $end): static
    {
        $this->currentPeriodEnd = $end;

        return $this;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'plan' => $this->plan->toArray(),
            'status' => $this->status,
            'currentPeriodStart' => $this->currentPeriodStart->format(DateTimeInterface::ATOM),
            'currentPeriodEnd' => $this->currentPeriodEnd?->format(DateTimeInterface::ATOM),
        ];
    }
}
