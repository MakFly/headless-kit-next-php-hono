<?php

declare(strict_types=1);

namespace App\Feature\Orders\Controller;

use App\Feature\Cart\Repository\CartRepository;
use App\Shared\Entity\Order;
use App\Shared\Entity\OrderItem;
use App\Shared\Security\Trait\AuthenticatedUserTrait;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/orders', name: 'api_v1_orders_create', methods: ['POST'])]
class CreateOrderController extends AbstractController
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
        $shippingAddress = $data['shippingAddress'] ?? null;

        if (!$shippingAddress || !\is_array($shippingAddress)) {
            return $this->api->error('VALIDATION_ERROR', 'shop.shipping_address_required', 400);
        }

        $cart = $this->cartRepository->findOrCreateForUser($user);

        if ($cart->getItems()->isEmpty()) {
            return $this->api->error('VALIDATION_ERROR', 'shop.cart_empty', 422);
        }

        $order = new Order();
        $order->setUser($user);
        $order->setShippingAddress($shippingAddress);
        $order->setNotes($data['notes'] ?? null);

        $total = 0;

        foreach ($cart->getItems() as $cartItem) {
            $product = $cartItem->getProduct();

            if ($cartItem->getQuantity() > $product->getStockQuantity()) {
                return $this->api->error(
                    'VALIDATION_ERROR',
                    'shop.insufficient_stock_for',
                    422,
                    ['product' => $product->getName()]
                );
            }

            $orderItem = OrderItem::fromCartItem($cartItem);
            $order->addItem($orderItem);
            $total += $orderItem->getSubtotal();

            $product->setStockQuantity($product->getStockQuantity() - $cartItem->getQuantity());
        }

        $order->setTotal($total);
        $order->setStatus('confirmed');

        $this->em->persist($order);

        // Clear cart
        foreach ($cart->getItems()->toArray() as $item) {
            $cart->getItems()->removeElement($item);
            $this->em->remove($item);
        }

        $this->em->flush();

        return $this->api->success($order->toArray(), 201);
    }
}
