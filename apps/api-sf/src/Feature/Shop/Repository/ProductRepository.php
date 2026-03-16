<?php

declare(strict_types=1);

namespace App\Feature\Shop\Repository;

use App\Shared\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\ORM\QueryBuilder;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Product>
 */
class ProductRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Product::class);
    }

    /**
     * @return Product[]
     */
    public function findAllFiltered(array $filters): array
    {
        $qb = $this->createFilteredQueryBuilder($filters);

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 12)));

        $qb->setFirstResult(($page - 1) * $perPage)
            ->setMaxResults($perPage);

        return $qb->getQuery()->getResult();
    }

    public function countFiltered(array $filters): int
    {
        $qb = $this->createFilteredQueryBuilder($filters);
        $qb->select('COUNT(p.id)');

        return (int) $qb->getQuery()->getSingleScalarResult();
    }

    public function findBySlug(string $slug): ?Product
    {
        return $this->createQueryBuilder('p')
            ->leftJoin('p.category', 'c')
            ->addSelect('c')
            ->where('p.slug = :slug')
            ->setParameter('slug', $slug)
            ->getQuery()
            ->getOneOrNullResult();
    }

    private function createFilteredQueryBuilder(array $filters): QueryBuilder
    {
        $qb = $this->createQueryBuilder('p')
            ->leftJoin('p.category', 'c')
            ->addSelect('c')
            ->where('p.status = :status')
            ->setParameter('status', 'active');

        if (!empty($filters['category'])) {
            $qb->andWhere('c.slug = :categorySlug')
                ->setParameter('categorySlug', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $qb->andWhere('p.name LIKE :search')
                ->setParameter('search', '%' . $filters['search'] . '%');
        }

        if (isset($filters['min_price'])) {
            $qb->andWhere('p.price >= :minPrice')
                ->setParameter('minPrice', (int) $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $qb->andWhere('p.price <= :maxPrice')
                ->setParameter('maxPrice', (int) $filters['max_price']);
        }

        if (isset($filters['featured'])) {
            $qb->andWhere('p.featured = :featured')
                ->setParameter('featured', filter_var($filters['featured'], FILTER_VALIDATE_BOOLEAN));
        }

        $sort = $filters['sort'] ?? 'newest';
        match ($sort) {
            'price_asc' => $qb->orderBy('p.price', 'ASC'),
            'price_desc' => $qb->orderBy('p.price', 'DESC'),
            'name_asc' => $qb->orderBy('p.name', 'ASC'),
            default => $qb->orderBy('p.createdAt', 'DESC'),
        };

        return $qb;
    }
}
