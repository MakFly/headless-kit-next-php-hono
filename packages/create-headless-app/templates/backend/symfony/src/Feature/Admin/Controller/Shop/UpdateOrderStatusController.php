<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Order;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/orders/{id}/status', name: 'api_v1_admin_shop_orders_update_status', methods: ['PATCH'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateOrderStatusController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $order = $this->em->getRepository(Order::class)->find($id);
        if ($order === null) {
            return $this->api->error('NOT_FOUND', 'shop.order_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $status = $data['status'] ?? null;

        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!$status || !in_array($status, $validStatuses, true)) {
            return $this->api->error('VALIDATION_ERROR', 'shop.invalid_order_status', 400);
        }

        $order->setStatus($status);

        if (isset($data['paymentStatus'])) {
            $validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
            if (in_array($data['paymentStatus'], $validPaymentStatuses, true)) {
                $order->setPaymentStatus($data['paymentStatus']);
            }
        }

        $this->em->flush();

        return $this->api->success($order->toArray());
    }
}
