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

#[Route('/api/v1/cart/items/{id}', name: 'api_v1_cart_remove_item', methods: ['DELETE'])]
class RemoveItemController extends AbstractController
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

        $cart = $this->cartRepository->findOrCreateForUser($user);

        $item = $this->findCartItem($cart, $id);
        if ($item === null) {
            return $this->api->error('NOT_FOUND', 'shop.cart_item_not_found', 404);
        }

        $cart->getItems()->removeElement($item);
        $this->em->remove($item);
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
