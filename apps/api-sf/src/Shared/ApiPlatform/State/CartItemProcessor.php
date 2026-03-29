<?php

declare(strict_types=1);

namespace App\Shared\ApiPlatform\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Shared\Entity\Cart;
use App\Shared\Entity\CartItem;
use App\Shared\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<CartItem, CartItem>
 */
final class CartItemProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
    ) {
    }

    /**
     * @param CartItem $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): CartItem
    {
        $user = $this->security->getUser();
        \assert($user instanceof User);

        // Find or create user's cart
        $cart = $this->em->getRepository(Cart::class)->findOneBy(['user' => $user]);
        if ($cart === null) {
            $cart = new Cart();
            $cart->setUser($user);
            $this->em->persist($cart);
        }

        $data->setCart($cart);

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
