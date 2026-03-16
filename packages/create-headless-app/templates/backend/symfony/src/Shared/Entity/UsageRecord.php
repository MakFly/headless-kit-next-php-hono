<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'usage_records')]
class UsageRecord
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Organization::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    /** api_calls | storage | members | projects */
    #[ORM\Column(type: 'string')]
    private string $metric;

    #[ORM\Column(type: 'integer')]
    private int $value;

    #[ORM\Column(type: 'integer')]
    private int $limitValue;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $recordedAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->recordedAt = new \DateTimeImmutable();
    }

    public function getId(): string { return $this->id; }

    public function getOrganization(): Organization { return $this->organization; }
    public function setOrganization(Organization $organization): static { $this->organization = $organization; return $this; }

    public function getMetric(): string { return $this->metric; }
    public function setMetric(string $metric): static { $this->metric = $metric; return $this; }

    public function getValue(): int { return $this->value; }
    public function setValue(int $value): static { $this->value = $value; return $this; }

    public function getLimitValue(): int { return $this->limitValue; }
    public function setLimitValue(int $limitValue): static { $this->limitValue = $limitValue; return $this; }

    public function getRecordedAt(): \DateTimeImmutable { return $this->recordedAt; }
    public function setRecordedAt(\DateTimeImmutable $recordedAt): static { $this->recordedAt = $recordedAt; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'metric' => $this->metric,
            'value' => $this->value,
            'limitValue' => $this->limitValue,
            'recordedAt' => $this->recordedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
