<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Shared\ApiPlatform\State\ConversationProcessor;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/support/conversations', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
        new Get(uriTemplate: '/support/conversations/{id}', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
        new Post(
            uriTemplate: '/support/conversations',
            security: 'is_granted("IS_AUTHENTICATED_FULLY")',
            processor: ConversationProcessor::class,
        ),
    ],
    normalizationContext: ['groups' => ['conversation:read']],
    denormalizationContext: ['groups' => ['conversation:write']],
    order: ['createdAt' => 'DESC'],
)]
#[ORM\Entity]
#[ORM\Table(name: 'conversations')]
#[ORM\HasLifecycleCallbacks]
class Conversation
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['conversation:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', nullable: false)]
    #[Groups(['conversation:read'])]
    private User $user;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'agent_id', nullable: true)]
    #[Groups(['conversation:read'])]
    private ?User $agent = null;

    #[ORM\Column(type: 'string')]
    #[Groups(['conversation:read', 'conversation:write'])]
    private string $subject;

    /** open | assigned | waiting | resolved | closed */
    #[ORM\Column(type: 'string')]
    #[Groups(['conversation:read'])]
    private string $status = 'open';

    /** low | medium | high | urgent */
    #[ORM\Column(type: 'string')]
    #[Groups(['conversation:read', 'conversation:write'])]
    private string $priority = 'medium';

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['conversation:read'])]
    private ?int $rating = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['conversation:read'])]
    private ?DateTimeImmutable $lastMessageAt = null;

    /** @var Collection<int, ChatMessage> */
    #[ORM\OneToMany(targetEntity: ChatMessage::class, mappedBy: 'conversation', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['createdAt' => 'ASC'])]
    #[Groups(['conversation:read'])]
    private Collection $messages;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['conversation:read'])]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['conversation:read'])]
    private DateTimeImmutable $updatedAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->messages = new ArrayCollection();
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

    public function getUser(): User
    {
        return $this->user;
    }

    public function setUser(User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getAgent(): ?User
    {
        return $this->agent;
    }

    public function setAgent(?User $agent): static
    {
        $this->agent = $agent;

        return $this;
    }

    public function getSubject(): string
    {
        return $this->subject;
    }

    public function setSubject(string $subject): static
    {
        $this->subject = $subject;

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

    public function getPriority(): string
    {
        return $this->priority;
    }

    public function setPriority(string $priority): static
    {
        $this->priority = $priority;

        return $this;
    }

    public function getRating(): ?int
    {
        return $this->rating;
    }

    public function setRating(?int $rating): static
    {
        $this->rating = $rating;

        return $this;
    }

    public function getLastMessageAt(): ?DateTimeImmutable
    {
        return $this->lastMessageAt;
    }

    public function setLastMessageAt(?DateTimeImmutable $lastMessageAt): static
    {
        $this->lastMessageAt = $lastMessageAt;

        return $this;
    }

    /** @return Collection<int, ChatMessage> */
    public function getMessages(): Collection
    {
        return $this->messages;
    }

    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function toArray(bool $withMessages = false): array
    {
        $data = [
            'id' => $this->id,
            'userId' => $this->user->getId(),
            'userEmail' => $this->user->getEmail(),
            'agentId' => $this->agent?->getId(),
            'agentEmail' => $this->agent?->getEmail(),
            'subject' => $this->subject,
            'status' => $this->status,
            'priority' => $this->priority,
            'rating' => $this->rating,
            'lastMessageAt' => $this->lastMessageAt?->format(DateTimeInterface::ATOM),
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
            'updatedAt' => $this->updatedAt->format(DateTimeInterface::ATOM),
        ];

        if ($withMessages) {
            $data['messages'] = array_map(
                fn (ChatMessage $m) => $m->toArray(),
                $this->messages->toArray(),
            );
        }

        return $data;
    }
}
