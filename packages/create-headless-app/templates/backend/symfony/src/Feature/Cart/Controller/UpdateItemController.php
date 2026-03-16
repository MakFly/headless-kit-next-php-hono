<?php

declare(strict_types=1);

namespace App\Feature\Cart\Controller;

use App\Feature\Cart\Repository\CartRepository;
use App\Shared\Entity\Cart;
use App\Shared\Entity\CartItem;
use App\Shared\Security\Trait\AuthenticatedUserTrait;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/cart/items/{id}', name: 'api_v1_cart_update_item', methods: ['PATCH'])]
class UpdateItemController extends AbstractController
{
    use AuthenticatedUserTrait;

    public function __construct(
        private readonly CartRepository $cartRepository,
        private readonly EntityManagerInterface $em,
        private readonly TokenManager $tokenManager,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $user = $this->getAuthenticatedUserOrFail($request);

        $data = json_decode($request->getContent(), true) ?? [];
        $quantity = isset($data['quantity']) ? (int) $data['quantity'] : null;

        if ($quantity === null || $quantity < 1) {
            return $this->api->error('VALIDATION_ERROR', 'shop.quantity_min_one', 400);
        }

        $cart = $this->cartRepository->findOrCreateForUser($user);

        $item = $this->findCartItem($cart, $id);
        if ($item === null) {
            return $this->api->error('NOT_FOUND', 'shop.cart_item_not_found', 404);
        }

        if ($quantity > $item->getProduct()->getStockQuantity()) {
            return $this->api->error('VALIDATION_ERROR', 'shop.insufficient_stock', 422);
        }

        $item->setQuantity($quantity);
        $this->em->flush();

        return $this->api->success($cart->toArray());
    }

    private function findCartItem(Cart $cart, string $itemId): ?CartItem
    {
        foreach ($cart->getItems() as $item) {
            if ($item->getId() === $itemId) {
                return $item;
            }
        }

        return null;
    }
}
