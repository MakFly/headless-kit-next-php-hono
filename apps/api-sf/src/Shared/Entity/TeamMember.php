<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Shared\ApiPlatform\State\TeamMemberProcessor;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/saas/team', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
        new Post(
            uriTemplate: '/saas/team',
            security: 'is_granted("IS_AUTHENTICATED_FULLY")',
            processor: TeamMemberProcessor::class,
        ),
        new Patch(
            uriTemplate: '/saas/team/{id}',
            security: 'is_granted("IS_AUTHENTICATED_FULLY")',
            processor: TeamMemberProcessor::class,
        ),
        new Delete(uriTemplate: '/saas/team/{id}', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
    ],
    normalizationContext: ['groups' => ['team:read']],
    denormalizationContext: ['groups' => ['team:write']],
)]
#[ORM\Entity]
#[ORM\Table(name: 'team_members')]
#[ORM\UniqueConstraint(columns: ['organization_id', 'user_id'])]
class TeamMember
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['team:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Organization::class, inversedBy: 'teamMembers')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Organization $organization;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['team:read'])]
    private User $user;

    /** owner | admin | member | viewer */
    #[ORM\Column(type: 'string')]
    #[Groups(['team:read', 'team:write'])]
    private string $role = 'member';

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['team:read'])]
    private DateTimeImmutable $joinedAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->joinedAt = new DateTimeImmutable();
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

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getRole(): string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getJoinedAt(): DateTimeImmutable
    {
        return $this->joinedAt;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'email' => $this->user->getEmail(),
                'username' => $this->user->getUsername(),
            ],
            'role' => $this->role,
            'joinedAt' => $this->joinedAt->format(DateTimeInterface::ATOM),
        ];
    }
}
