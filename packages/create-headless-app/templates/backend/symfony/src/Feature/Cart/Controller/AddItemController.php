<?php

declare(strict_types=1);

namespace App\Feature\Cart\Controller;

use App\Feature\Cart\Repository\CartRepository;
use App\Shared\Entity\CartItem;
use App\Shared\Entity\Product;
use App\Shared\Security\Trait\AuthenticatedUserTrait;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/cart/items', name: 'api_v1_cart_add_item', methods: ['POST'])]
class AddItemController extends AbstractController
{
    use AuthenticatedUserTrait;

    public function __construct(
        private readonly CartRepository $cartRepository,
        private readonly EntityManagerInterface $em,
        private readonly TokenManager $tokenManager,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUserOrFail($request);

        $data = json_decode($request->getContent(), true) ?? [];
        $productId = $data['productId'] ?? null;
        $quantity = (int) ($data['quantity'] ?? 1);

        if (!$productId) {
            return $this->api->error('VALIDATION_ERROR', 'shop.product_id_required', 400);
        }

        if ($quantity < 1) {
            return $this->api->error('VALIDATION_ERROR', 'shop.quantity_min_one', 400);
        }

        $product = $this->em->getRepository(Product::class)->find($productId);
        if ($product === null || $product->getStatus() !== 'active') {
            return $this->api->error('NOT_FOUND', 'shop.product_not_available', 404);
        }

        $cart = $this->cartRepository->findOrCreateForUser($user);

        $existingItem = $cart->findItemByProduct($product);
        if ($existingItem !== null) {
            $newQuantity = $existingItem->getQuantity() + $quantity;
            if ($newQuantity > $product->getStockQuantity()) {
                return $this->api->error('VALIDATION_ERROR', 'shop.insufficient_stock', 422);
            }
            $existingItem->setQuantity($newQuantity);
        } else {
            if ($quantity > $product->getStockQuantity()) {
                return $this->api->error('VALIDATION_ERROR', 'shop.insufficient_stock', 422);
            }
            $item = new CartItem();
            $item->setProduct($product);
            $item->setQuantity($quantity);
            $cart->addItem($item);
        }

        $this->em->flush();

        return $this->api->success($cart->toArray(), 201);
    }
}
