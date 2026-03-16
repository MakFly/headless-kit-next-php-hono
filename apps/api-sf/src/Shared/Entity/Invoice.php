<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/saas/invoices', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
    ],
    normalizationContext: ['groups' => ['invoice:read']],
    order: ['createdAt' => 'DESC'],
)]
#[ORM\Entity]
#[ORM\Table(name: 'invoices')]
class Invoice
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['invoice:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Organization::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\Column(type: 'integer')]
    #[Groups(['invoice:read'])]
    private int $amount;

    /** paid | pending | overdue | void */
    #[ORM\Column(type: 'string')]
    #[Groups(['invoice:read'])]
    private string $status = 'pending';

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['invoice:read'])]
    private \DateTimeImmutable $periodStart;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['invoice:read'])]
    private \DateTimeImmutable $periodEnd;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['invoice:read'])]
    private ?\DateTimeImmutable $paidAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['invoice:read'])]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): string { return $this->id; }

    public function getOrganization(): Organization { return $this->organization; }
    public function setOrganization(Organization $organization): static { $this->organization = $organization; return $this; }

    public function getAmount(): int { return $this->amount; }
    public function setAmount(int $amount): static { $this->amount = $amount; return $this; }

    public function getStatus(): string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function getPeriodStart(): \DateTimeImmutable { return $this->periodStart; }
    public function setPeriodStart(\DateTimeImmutable $periodStart): static { $this->periodStart = $periodStart; return $this; }

    public function getPeriodEnd(): \DateTimeImmutable { return $this->periodEnd; }
    public function setPeriodEnd(\DateTimeImmutable $periodEnd): static { $this->periodEnd = $periodEnd; return $this; }

    public function getPaidAt(): ?\DateTimeImmutable { return $this->paidAt; }
    public function setPaidAt(?\DateTimeImmutable $paidAt): static { $this->paidAt = $paidAt; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'amount' => $this->amount,
            'status' => $this->status,
            'periodStart' => $this->periodStart->format(\DateTimeInterface::ATOM),
            'periodEnd' => $this->periodEnd->format(\DateTimeInterface::ATOM),
            'paidAt' => $this->paidAt?->format(\DateTimeInterface::ATOM),
            'createdAt' => $this->createdAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
