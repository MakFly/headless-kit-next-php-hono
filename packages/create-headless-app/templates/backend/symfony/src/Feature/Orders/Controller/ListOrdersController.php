<?php

declare(strict_types=1);

namespace App\Feature\Orders\Controller;

use App\Feature\Orders\Repository\OrderRepository;
use App\Shared\Entity\Order;
use App\Shared\Security\Trait\AuthenticatedUserTrait;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/orders', name: 'api_v1_orders_list', methods: ['GET'])]
class ListOrdersController extends AbstractController
{
    use AuthenticatedUserTrait;

    public function __construct(
        private readonly OrderRepository $orderRepository,
        private readonly EntityManagerInterface $em,
        private readonly TokenManager $tokenManager,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUserOrFail($request);

        $orders = $this->orderRepository->findByUser($user);

        return $this->api->success(array_map(fn (Order $o) => $o->toArray(), $orders));
    }
}
