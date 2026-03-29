<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/support/conversations/{conversationId}/messages', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
        new Post(uriTemplate: '/support/conversations/{conversationId}/messages', security: 'is_granted("IS_AUTHENTICATED_FULLY")'),
    ],
    normalizationContext: ['groups' => ['message:read']],
    denormalizationContext: ['groups' => ['message:write']],
    order: ['createdAt' => 'ASC'],
)]
#[ORM\Entity]
#[ORM\Table(name: 'messages')]
class ChatMessage
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['message:read', 'conversation:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Conversation::class, inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Conversation $conversation;

    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['message:read', 'conversation:read'])]
    private string $senderId;

    /** user | agent | system */
    #[ORM\Column(type: 'string')]
    #[Groups(['message:read', 'conversation:read'])]
    private string $senderType = 'user';

    #[ORM\Column(type: 'text')]
    #[Groups(['message:read', 'message:write', 'conversation:read'])]
    private string $content;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['message:read', 'conversation:read'])]
    private DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->createdAt = new DateTimeImmutable();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getConversation(): Conversation
    {
        return $this->conversation;
    }

    public function setConversation(Conversation $conversation): static
    {
        $this->conversation = $conversation;

        return $this;
    }

    public function getSenderId(): string
    {
        return $this->senderId;
    }

    public function setSenderId(string $senderId): static
    {
        $this->senderId = $senderId;

        return $this;
    }

    public function getSenderType(): string
    {
        return $this->senderType;
    }

    public function setSenderType(string $senderType): static
    {
        $this->senderType = $senderType;

        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

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
            'senderId' => $this->senderId,
            'senderType' => $this->senderType,
            'content' => $this->content,
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
        ];
    }
}
