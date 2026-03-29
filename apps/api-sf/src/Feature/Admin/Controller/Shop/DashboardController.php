<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Order;
use App\Shared\Entity\Product;
use App\Shared\Entity\User;
use App\Shared\Repository\ReviewRepository;
use App\Shared\Service\ApiResponseService;
use DateTimeInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/dashboard', name: 'api_v1_admin_shop_dashboard', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class DashboardController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ReviewRepository $reviewRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $totalProducts = (int) $this->em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Product::class, 'p')
            ->getQuery()->getSingleScalarResult();

        $activeProducts = (int) $this->em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Product::class, 'p')
            ->where('p.status = :status')
            ->setParameter('status', 'active')
            ->getQuery()->getSingleScalarResult();

        $totalOrders = (int) $this->em->createQueryBuilder()
            ->select('COUNT(o.id)')
            ->from(Order::class, 'o')
            ->getQuery()->getSingleScalarResult();

        $totalRevenue = (int) $this->em->createQueryBuilder()
            ->select('COALESCE(SUM(o.total), 0)')
            ->from(Order::class, 'o')
            ->where('o.paymentStatus = :paid')
            ->setParameter('paid', 'paid')
            ->getQuery()->getSingleScalarResult();

        $totalCustomers = (int) $this->em->createQueryBuilder()
            ->select('COUNT(u.id)')
            ->from(User::class, 'u')
            ->getQuery()->getSingleScalarResult();

        $pendingOrders = (int) $this->em->createQueryBuilder()
            ->select('COUNT(o.id)')
            ->from(Order::class, 'o')
            ->where('o.status = :status')
            ->setParameter('status', 'pending')
            ->getQuery()->getSingleScalarResult();

        $lowStockProducts = (int) $this->em->createQueryBuilder()
            ->select('COUNT(p.id)')
            ->from(Product::class, 'p')
            ->where('p.stockQuantity <= :threshold')
            ->andWhere('p.status = :status')
            ->setParameter('threshold', 10)
            ->setParameter('status', 'active')
            ->getQuery()->getSingleScalarResult();

        $reviewCounts = $this->reviewRepository->countByStatus();

        $recentOrders = $this->em->createQueryBuilder()
            ->select('o')
            ->from(Order::class, 'o')
            ->leftJoin('o.user', 'u')
            ->addSelect('u')
            ->orderBy('o.createdAt', 'DESC')
            ->setMaxResults(5)
            ->getQuery()->getResult();

        return $this->api->success([
            'totalProducts' => $totalProducts,
            'activeProducts' => $activeProducts,
            'totalOrders' => $totalOrders,
            'totalRevenue' => $totalRevenue,
            'totalCustomers' => $totalCustomers,
            'pendingOrders' => $pendingOrders,
            'lowStockProducts' => $lowStockProducts,
            'reviews' => $reviewCounts,
            'recentOrders' => array_map(function (Order $o) {
                return [
                    'id' => $o->getId(),
                    'status' => $o->getStatus(),
                    'total' => $o->getTotal(),
                    'paymentStatus' => $o->getPaymentStatus(),
                    'customerEmail' => $o->getUser()->getEmail(),
                    'createdAt' => $o->getCreatedAt()->format(DateTimeInterface::ATOM),
                ];
            }, $recentOrders),
        ]);
    }
}
