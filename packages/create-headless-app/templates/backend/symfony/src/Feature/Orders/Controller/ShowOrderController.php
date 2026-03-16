<?php

declare(strict_types=1);

namespace App\Feature\Orders\Controller;

use App\Feature\Orders\Repository\OrderRepository;
use App\Shared\Security\Trait\AuthenticatedUserTrait;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/orders/{id}', name: 'api_v1_orders_detail', methods: ['GET'])]
class ShowOrderController extends AbstractController
{
    use AuthenticatedUserTrait;

    public function __construct(
        private readonly OrderRepository $orderRepository,
        private readonly EntityManagerInterface $em,
        private readonly TokenManager $tokenManager,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $user = $this->getAuthenticatedUserOrFail($request);

        $order = $this->orderRepository->findOneByIdAndUser($id, $user);

        if ($order === null) {
            return $this->api->error('NOT_FOUND', 'shop.order_not_found', 404);
        }

        return $this->api->success($order->toArray());
    }
}
