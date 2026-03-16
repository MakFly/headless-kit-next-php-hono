<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'team_members')]
#[ORM\UniqueConstraint(name: 'UNIQ_team_members_org_user', columns: ['organization_id', 'user_id'])]
class TeamMember
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Organization::class, inversedBy: 'teamMembers')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private User $user;

    /** viewer | member | admin | owner */
    #[ORM\Column(type: 'string')]
    private string $role = 'member';

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $joinedAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->joinedAt = new \DateTimeImmutable();
    }

    public function getId(): string { return $this->id; }

    public function getOrganization(): Organization { return $this->organization; }
    public function setOrganization(Organization $organization): static { $this->organization = $organization; return $this; }

    public function getUser(): User { return $this->user; }
    public function setUser(User $user): static { $this->user = $user; return $this; }

    public function getRole(): string { return $this->role; }
    public function setRole(string $role): static { $this->role = $role; return $this; }

    public function getJoinedAt(): \DateTimeImmutable { return $this->joinedAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'userId' => $this->user->getId(),
            'userEmail' => $this->user->getEmail(),
            'userName' => $this->user->getName(),
            'role' => $this->role,
            'joinedAt' => $this->joinedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
