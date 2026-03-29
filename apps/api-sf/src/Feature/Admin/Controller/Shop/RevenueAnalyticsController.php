<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Order;
use App\Shared\Service\ApiResponseService;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/analytics/revenue', name: 'api_v1_admin_shop_analytics_revenue', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class RevenueAnalyticsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $days = min(365, max(1, (int) $request->query->get('days', 30)));
        $since = new DateTimeImmutable("-{$days} days");

        $orders = $this->em->createQueryBuilder()
            ->select('o')
            ->from(Order::class, 'o')
            ->where('o.createdAt >= :since')
            ->setParameter('since', $since)
            ->orderBy('o.createdAt', 'ASC')
            ->getQuery()->getResult();

        $dailyRevenue = [];
        $totalRevenue = 0;
        $orderCount = 0;

        foreach ($orders as $order) {
            /** @var Order $order */
            $day = $order->getCreatedAt()->format('Y-m-d');
            if (!isset($dailyRevenue[$day])) {
                $dailyRevenue[$day] = ['date' => $day, 'revenue' => 0, 'orders' => 0];
            }
            $dailyRevenue[$day]['revenue'] += $order->getTotal();
            ++$dailyRevenue[$day]['orders'];
            $totalRevenue += $order->getTotal();
            ++$orderCount;
        }

        return $this->api->success([
            'totalRevenue' => $totalRevenue,
            'orderCount' => $orderCount,
            'averageOrderValue' => $orderCount > 0 ? (int) round($totalRevenue / $orderCount) : 0,
            'daily' => array_values($dailyRevenue),
        ]);
    }
}
