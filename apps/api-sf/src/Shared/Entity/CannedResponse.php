<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/support/canned-responses', security: 'is_granted("ROLE_ADMIN")'),
        new Get(uriTemplate: '/support/canned-responses/{id}', security: 'is_granted("ROLE_ADMIN")'),
        new Post(uriTemplate: '/support/canned-responses', security: 'is_granted("ROLE_ADMIN")'),
        new Put(uriTemplate: '/support/canned-responses/{id}', security: 'is_granted("ROLE_ADMIN")'),
        new Delete(uriTemplate: '/support/canned-responses/{id}', security: 'is_granted("ROLE_ADMIN")'),
    ],
    normalizationContext: ['groups' => ['canned:read']],
    denormalizationContext: ['groups' => ['canned:write']],
)]
#[ORM\Entity]
#[ORM\Table(name: 'canned_responses')]
#[ORM\HasLifecycleCallbacks]
class CannedResponse
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['canned:read'])]
    private string $id;

    #[ORM\Column(type: 'string')]
    #[Groups(['canned:read', 'canned:write'])]
    private string $title;

    #[ORM\Column(type: 'text')]
    #[Groups(['canned:read', 'canned:write'])]
    private string $content;

    #[ORM\Column(type: 'string', nullable: true)]
    #[Groups(['canned:read', 'canned:write'])]
    private ?string $category = null;

    #[ORM\Column(type: 'string', nullable: true)]
    #[Groups(['canned:read', 'canned:write'])]
    private ?string $shortcut = null;

    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['canned:read'])]
    private string $createdBy;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['canned:read'])]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['canned:read'])]
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

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

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

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;

        return $this;
    }

    public function getShortcut(): ?string
    {
        return $this->shortcut;
    }

    public function setShortcut(?string $shortcut): static
    {
        $this->shortcut = $shortcut;

        return $this;
    }

    public function getCreatedBy(): string
    {
        return $this->createdBy;
    }

    public function setCreatedBy(string $createdBy): static
    {
        $this->createdBy = $createdBy;

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
            'title' => $this->title,
            'content' => $this->content,
            'category' => $this->category,
            'shortcut' => $this->shortcut,
            'createdBy' => $this->createdBy,
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
            'updatedAt' => $this->updatedAt->format(DateTimeInterface::ATOM),
        ];
    }
}
