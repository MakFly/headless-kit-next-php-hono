<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Order;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/customers/{id}', name: 'api_v1_admin_shop_customers_get', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ShowCustomerController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if ($user === null) {
            return $this->api->error('NOT_FOUND', 'admin.customer_not_found', 404);
        }

        $orderCount = (int) $this->em->createQueryBuilder()
            ->select('COUNT(o.id)')
            ->from(Order::class, 'o')
            ->where('o.user = :user')
            ->setParameter('user', $user)
            ->getQuery()->getSingleScalarResult();

        $totalSpent = (int) ($this->em->createQueryBuilder()
            ->select('COALESCE(SUM(o.total), 0)')
            ->from(Order::class, 'o')
            ->where('o.user = :user')
            ->setParameter('user', $user)
            ->getQuery()->getSingleScalarResult());

        return $this->api->success([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'emailVerified' => $user->isEmailVerified(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $user->getUpdatedAt()->format(\DateTimeInterface::ATOM),
            'orderCount' => $orderCount,
            'totalSpent' => $totalSpent,
        ]);
    }
}
