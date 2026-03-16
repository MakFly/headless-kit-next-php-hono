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

#[Route('/api/v1/admin/orders', name: 'api_v1_admin_shop_orders_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListOrdersController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $qb = $this->em->createQueryBuilder()
            ->select('o')
            ->from(Order::class, 'o')
            ->leftJoin('o.items', 'i')
            ->addSelect('i')
            ->leftJoin('o.user', 'u')
            ->addSelect('u');

        if ($status = $request->query->get('status')) {
            $qb->andWhere('o.status = :status')->setParameter('status', $status);
        }

        $qb->orderBy('o.createdAt', 'DESC');

        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('per_page', 20)));
        $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);

        $orders = $qb->getQuery()->getResult();

        $countQb = $this->em->createQueryBuilder()
            ->select('COUNT(o2.id)')
            ->from(Order::class, 'o2');
        if ($status) {
            $countQb->andWhere('o2.status = :status')->setParameter('status', $status);
        }
        $total = (int) $countQb->getQuery()->getSingleScalarResult();

        $data = array_map(function (Order $o) {
            $arr = $o->toArray();
            $arr['user'] = [
                'id' => $o->getUser()->getId(),
                'email' => $o->getUser()->getEmail(),
                'username' => $o->getUser()->getUsername(),
            ];

            return $arr;
        }, $orders);

        return $this->api->paginated($data, $page, $perPage, $total);
    }
}
