<?php

declare(strict_types=1);

namespace App\Shared\Repository;

use App\Shared\Entity\Review;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Review>
 */
class ReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Review::class);
    }

    /**
     * @return Review[]
     */
    public function findAllFiltered(array $filters): array
    {
        $qb = $this->createQueryBuilder('r')
            ->leftJoin('r.product', 'p')
            ->addSelect('p')
            ->leftJoin('r.user', 'u')
            ->addSelect('u');

        if (!empty($filters['status'])) {
            $qb->andWhere('r.status = :status')
                ->setParameter('status', $filters['status']);
        }

        if (!empty($filters['productId'])) {
            $qb->andWhere('p.id = :productId')
                ->setParameter('productId', $filters['productId']);
        }

        if (!empty($filters['rating'])) {
            $qb->andWhere('r.rating = :rating')
                ->setParameter('rating', (int) $filters['rating']);
        }

        $qb->orderBy('r.createdAt', 'DESC');

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        $qb->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage);

        return $qb->getQuery()->getResult();
    }

    public function countFiltered(array $filters): int
    {
        $qb = $this->createQueryBuilder('r')
            ->select('COUNT(r.id)');

        if (!empty($filters['status'])) {
            $qb->andWhere('r.status = :status')
                ->setParameter('status', $filters['status']);
        }

        if (!empty($filters['productId'])) {
            $qb->leftJoin('r.product', 'p')
                ->andWhere('p.id = :productId')
                ->setParameter('productId', $filters['productId']);
        }

        if (!empty($filters['rating'])) {
            $qb->andWhere('r.rating = :rating')
                ->setParameter('rating', (int) $filters['rating']);
        }

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    /**
     * @return array{pending: int, approved: int, rejected: int}
     */
    public function countByStatus(): array
    {
        $results = $this->createQueryBuilder('r')
            ->select('r.status, COUNT(r.id) as cnt')
            ->groupBy('r.status')
            ->getQuery()
            ->getResult();

        $counts = ['pending' => 0, 'approved' => 0, 'rejected' => 0];
        foreach ($results as $row) {
            $counts[$row['status']] = (int) $row['cnt'];
        }

        return $counts;
    }
}
