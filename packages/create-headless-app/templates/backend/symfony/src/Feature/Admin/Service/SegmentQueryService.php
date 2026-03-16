<?php

declare(strict_types=1);

namespace App\Feature\Admin\Service;

use App\Shared\Entity\Order;
use App\Shared\Entity\Segment;
use App\Shared\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class SegmentQueryService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    public function computeCount(Segment $segment): int
    {
        $criteria = $segment->getCriteria();

        if (isset($criteria['min_orders'])) {
            $minOrders = (int) $criteria['min_orders'];
            $maxOrders = isset($criteria['max_orders']) ? (int) $criteria['max_orders'] : null;

            $sql = 'SELECT COUNT(*) FROM (SELECT user_id FROM orders GROUP BY user_id HAVING COUNT(*) >= ?';
            $params = [$minOrders];

            if ($maxOrders !== null) {
                $sql .= ' AND COUNT(*) <= ?';
                $params[] = $maxOrders;
            }

            $sql .= ')';

            return (int) $this->em->getConnection()->executeQuery($sql, $params)->fetchOne();
        }

        if (isset($criteria['min_total_spent'])) {
            $minSpent = (int) $criteria['min_total_spent'];

            return (int) $this->em->getConnection()->executeQuery(
                'SELECT COUNT(*) FROM (SELECT user_id FROM orders GROUP BY user_id HAVING SUM(total) >= ?)',
                [$minSpent]
            )->fetchOne();
        }

        if (!empty($criteria['no_orders'])) {
            $totalUsers = (int) $this->em->createQueryBuilder()
                ->select('COUNT(u.id)')
                ->from(User::class, 'u')
                ->getQuery()->getSingleScalarResult();

            $usersWithOrders = (int) $this->em->createQueryBuilder()
                ->select('COUNT(DISTINCT o.user)')
                ->from(Order::class, 'o')
                ->getQuery()->getSingleScalarResult();

            return $totalUsers - $usersWithOrders;
        }

        if (isset($criteria['min_unique_categories'])) {
            $minCats = (int) $criteria['min_unique_categories'];

            return (int) $this->em->getConnection()->executeQuery(
                'SELECT COUNT(*) FROM (
                    SELECT o.user_id
                    FROM orders o
                    JOIN order_items oi ON oi.order_id = o.id
                    JOIN products p ON oi.product_id = p.id
                    WHERE p.category_id IS NOT NULL
                    GROUP BY o.user_id
                    HAVING COUNT(DISTINCT p.category_id) >= ?
                )',
                [$minCats]
            )->fetchOne();
        }

        return 0;
    }
}
