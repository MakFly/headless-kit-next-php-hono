<?php

declare(strict_types=1);

namespace App\Feature\Shop\Repository;

use App\Shared\Entity\Category;
use App\Shared\Entity\Product;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Category>
 */
class CategoryRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Category::class);
    }

    /**
     * @return array<array{category: Category, productCount: int}>
     */
    public function findAllWithProductCount(): array
    {
        $qb = $this->createQueryBuilder('c')
            ->select('c', 'COUNT(p.id) AS productCount')
            ->leftJoin('c.products', 'p', 'WITH', 'p.status = :status')
            ->setParameter('status', 'active')
            ->groupBy('c.id')
            ->orderBy('c.sortOrder', 'ASC')
            ->addOrderBy('c.name', 'ASC');

        $results = $qb->getQuery()->getResult();

        return array_map(fn (array $row) => [
            'category' => $row[0],
            'productCount' => (int) $row['productCount'],
        ], $results);
    }

    public function findBySlugWithProducts(string $slug): ?array
    {
        $category = $this->findOneBy(['slug' => $slug]);

        if ($category === null) {
            return null;
        }

        $em = $this->getEntityManager();
        $products = $em->getRepository(Product::class)
            ->createQueryBuilder('p')
            ->where('p.category = :category')
            ->andWhere('p.status = :status')
            ->setParameter('category', $category)
            ->setParameter('status', 'active')
            ->getQuery()
            ->getResult();

        return ['category' => $category, 'products' => $products];
    }
}
