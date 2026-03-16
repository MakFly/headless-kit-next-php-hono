<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

#[ORM\Entity]
#[ORM\Table(name: 'messages')]
class ChatMessage
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Conversation::class, inversedBy: 'messages')]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private Conversation $conversation;

    #[ORM\Column(type: 'string', length: 36)]
    private string $senderId;

    /** user | agent | system */
    #[ORM\Column(type: 'string')]
    private string $senderType = 'user';

    #[ORM\Column(type: 'text')]
    private string $content;

    #[ORM\Column(type: 'datetime_immutable')]
    private \DateTimeImmutable $createdAt;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): string { return $this->id; }

    public function getConversation(): Conversation { return $this->conversation; }
    public function setConversation(Conversation $conversation): static { $this->conversation = $conversation; return $this; }

    public function getSenderId(): string { return $this->senderId; }
    public function setSenderId(string $senderId): static { $this->senderId = $senderId; return $this; }

    public function getSenderType(): string { return $this->senderType; }
    public function setSenderType(string $senderType): static { $this->senderType = $senderType; return $this; }

    public function getContent(): string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }

    public function getCreatedAt(): \DateTimeImmutable { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'senderId' => $this->senderId,
            'senderType' => $this->senderType,
            'content' => $this->content,
            'createdAt' => $this->createdAt->format(\DateTimeInterface::ATOM),
        ];
    }
}
