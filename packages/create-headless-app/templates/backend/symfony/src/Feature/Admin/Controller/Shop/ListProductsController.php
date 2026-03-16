<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Product;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/products', name: 'api_v1_admin_shop_products_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListProductsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $qb = $this->em->createQueryBuilder()
            ->select('p')
            ->from(Product::class, 'p')
            ->leftJoin('p.category', 'c')
            ->addSelect('c');

        if ($status = $request->query->get('status')) {
            $qb->andWhere('p.status = :status')->setParameter('status', $status);
        }

        if ($search = $request->query->get('search')) {
            $qb->andWhere('p.name LIKE :search')->setParameter('search', '%' . $search . '%');
        }

        if ($categoryId = $request->query->get('category')) {
            $qb->andWhere('c.id = :catId')->setParameter('catId', $categoryId);
        }

        $qb->orderBy('p.createdAt', 'DESC');

        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('per_page', 20)));
        $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);

        $products = $qb->getQuery()->getResult();

        $countQb = $this->em->createQueryBuilder()
            ->select('COUNT(p2.id)')
            ->from(Product::class, 'p2');
        if ($status) {
            $countQb->andWhere('p2.status = :status')->setParameter('status', $status);
        }
        $total = (int) $countQb->getQuery()->getSingleScalarResult();

        return $this->api->paginated(
            array_map(fn (Product $p) => $p->toArray(), $products),
            $page,
            $perPage,
            $total
        );
    }
}
