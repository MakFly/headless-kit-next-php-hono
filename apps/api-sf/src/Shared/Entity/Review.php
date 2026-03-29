<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Shared\ApiPlatform\State\ReviewProcessor;
use App\Shared\Repository\ReviewRepository;
use DateTimeImmutable;
use DateTimeInterface;
use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ReviewRepository::class)]
#[ORM\Table(name: 'reviews')]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/reviews'),
        new Get(uriTemplate: '/reviews/{id}'),
        new Post(
            uriTemplate: '/reviews',
            security: 'is_granted("IS_AUTHENTICATED_FULLY")',
            processor: ReviewProcessor::class,
        ),
    ],
    normalizationContext: ['groups' => ['review:read']],
    denormalizationContext: ['groups' => ['review:write']],
    order: ['createdAt' => 'DESC'],
)]
class Review
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['review:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['review:read', 'review:write'])]
    private Product $product;

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    #[Groups(['review:read'])]
    private User $user;

    #[ORM\Column(type: 'integer')]
    #[Groups(['review:read', 'review:write'])]
    private int $rating;

    #[ORM\Column(type: 'string', nullable: true)]
    #[Groups(['review:read', 'review:write'])]
    private ?string $title = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['review:read', 'review:write'])]
    private ?string $comment = null;

    /** pending | approved | rejected */
    #[ORM\Column(type: 'string')]
    #[Groups(['review:read'])]
    private string $status = 'pending';

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['review:read'])]
    private DateTimeImmutable $createdAt;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['review:read'])]
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

    public function getProduct(): Product
    {
        return $this->product;
    }

    public function setProduct(Product $product): static
    {
        $this->product = $product;

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

    public function getRating(): int
    {
        return $this->rating;
    }

    public function setRating(int $rating): static
    {
        $this->rating = max(1, min(5, $rating));

        return $this;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getComment(): ?string
    {
        return $this->comment;
    }

    public function setComment(?string $comment): static
    {
        $this->comment = $comment;

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
            'productId' => $this->product->getId(),
            'productName' => $this->product->getName(),
            'userId' => $this->user->getId(),
            'userEmail' => $this->user->getEmail(),
            'rating' => $this->rating,
            'title' => $this->title,
            'comment' => $this->comment,
            'status' => $this->status,
            'createdAt' => $this->createdAt->format(DateTimeInterface::ATOM),
            'updatedAt' => $this->updatedAt->format(DateTimeInterface::ATOM),
        ];
    }
}
