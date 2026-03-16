<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/saas/organizations', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
        new Get(uriTemplate: '/saas/organizations/{id}', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
        new Post(uriTemplate: '/saas/organizations', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
    ],
    normalizationContext: ['groups' => ['org:read']],
    denormalizationContext: ['groups' => ['org:write']],
    order: ['createdAt' => 'DESC'],
)]
#[ORM\Entity]
#[ORM\Table(name: 'organizations')]
#[ORM\HasLifecycleCallbacks]
class Organization
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['org:read'])]
    private string $id;

    #[ORM\Column(type: 'string')]
    #[Groups(['org:read', 'org:write'])]
    private string $name;

    #[ORM\Column(type: 'string', unique: true)]
    #[Groups(['org:read', 'org:write'])]
    private string $slug;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'owner_id', nullable: false)]
    #[Groups(['org:read'])]
    private User $owner;

    #[ORM\ManyToOne(targetEntity: Plan::class)]
    #[ORM\JoinColumn(name: 'plan_id', nullable: true)]
    #[Groups(['org:read'])]
    private ?Plan $plan = null;

    /** @var Collection<int, TeamMember> */
    #[ORM\OneToMany(targetEntity: TeamMember::class, mappedBy: 'organization', cascade: ['persist', 'remove'], orphanRemoval: true)]
    private Collection $teamMembers;

    /** @var Collection<int, Subscription> */
    #[ORM\OneToMany(targetEntity: Subscription::class, mappedBy: 'organization', cascade: ['persist', 'remove'])]
    private Collection $subscriptions;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['org:read'])]
    private \DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['org:read'])]
    private \DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->teamMembers = new ArrayCollection();
        $this->subscriptions = new ArrayCollection();
        $this->createdAt = new \DateTimeImmutable();
        $this->updatedAt = new \DateTimeImmutable();
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): string { return $this->id; }

    public function getName(): string { return $this->name; }
    public function setName(string $name): static { $this->name = $name; return $this; }

    public function getSlug(): string { return $this->slug; }
    public function setSlug(string $slug): static { $this->slug = $slug; return $this; }

    public function getOwner(): User { return $this->owner; }
    public function setOwner(User $owner): static { $this->owner = $owner; return $this; }

    public function getPlan(): ?Plan { return $this->plan; }
    public function setPlan(?Plan $plan): static { $this->plan = $plan; return $this; }

    /** @return Collection<int, TeamMember> */
    public function getTeamMembers(): Collection { return $this->teamMembers; }

    public function addTeamMember(TeamMember $member): static
    {
        if (!$this->teamMembers->contains($member)) {
            $this->teamMembers->add($member);
            $member->setOrganization($this);
        }
        return $this;
    }

    /** @return Collection<int, Subscription> */
    public function getSubscriptions(): Collection { return $this->subscriptions; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): \DateTimeImmutable { return $this->updatedAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'ownerId' => $this->owner->getId(),
            'planId' => $this->plan?->getId(),
            'createdAt' => $this->createdAt->format(\DateTimeInterface::ATOM),
            'updatedAt' => $this->updatedAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
