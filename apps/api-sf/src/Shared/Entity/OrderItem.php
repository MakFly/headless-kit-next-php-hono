<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'order_items')]
class OrderItem
{
    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    #[Groups(['order:read'])]
    private string $id;

    #[ORM\ManyToOne(targetEntity: Order::class, inversedBy: 'items')]
    #[ORM\JoinColumn(name: 'order_id', nullable: false, onDelete: 'CASCADE')]
    private Order $order;

    #[ORM\ManyToOne(targetEntity: Product::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    private ?Product $product = null;

    #[ORM\Column(type: 'string')]
    #[Groups(['order:read'])]
    private string $productName;

    #[ORM\Column(type: 'integer')]
    #[Groups(['order:read'])]
    private int $productPrice;

    #[ORM\Column(type: 'integer')]
    #[Groups(['order:read'])]
    private int $quantity;

    #[ORM\Column(type: 'integer')]
    #[Groups(['order:read'])]
    private int $subtotal;

    public function __construct()
    {
        $this->id = Uuid::uuid7()->toString();
        $this->productPrice = 0;
        $this->quantity = 1;
        $this->subtotal = 0;
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getOrder(): Order
    {
        return $this->order;
    }

    public function setOrder(Order $order): static
    {
        $this->order = $order;

        return $this;
    }

    public function getProduct(): ?Product
    {
        return $this->product;
    }

    public function setProduct(?Product $product): static
    {
        $this->product = $product;

        return $this;
    }

    public function getProductName(): string
    {
        return $this->productName;
    }

    public function setProductName(string $productName): static
    {
        $this->productName = $productName;

        return $this;
    }

    public function getProductPrice(): int
    {
        return $this->productPrice;
    }

    public function setProductPrice(int $productPrice): static
    {
        $this->productPrice = $productPrice;

        return $this;
    }

    public function getQuantity(): int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }

    public function getSubtotal(): int
    {
        return $this->subtotal;
    }

    public function setSubtotal(int $subtotal): static
    {
        $this->subtotal = $subtotal;

        return $this;
    }

    public static function fromCartItem(CartItem $cartItem): self
    {
        $orderItem = new self();
        $product = $cartItem->getProduct();
        $orderItem->setProduct($product);
        $orderItem->setProductName($product->getName());
        $orderItem->setProductPrice($product->getPrice());
        $orderItem->setQuantity($cartItem->getQuantity());
        $orderItem->setSubtotal($product->getPrice() * $cartItem->getQuantity());

        return $orderItem;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'productId' => $this->product?->getId(),
            'productName' => $this->productName,
            'productPrice' => $this->productPrice,
            'quantity' => $this->quantity,
            'subtotal' => $this->subtotal,
        ];
    }
}
