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

#[Route('/api/v1/admin/inventory', name: 'api_v1_admin_shop_inventory_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class InventoryController extends AbstractController
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

        if ($request->query->has('low_stock')) {
            $qb->andWhere('p.stockQuantity <= :threshold')
                ->setParameter('threshold', (int) $request->query->get('threshold', 10));
        }

        $sort = $request->query->get('sort', 'stock_asc');
        match ($sort) {
            'stock_desc' => $qb->orderBy('p.stockQuantity', 'DESC'),
            'name_asc' => $qb->orderBy('p.name', 'ASC'),
            default => $qb->orderBy('p.stockQuantity', 'ASC'),
        };

        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('per_page', 20)));
        $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);

        $products = $qb->getQuery()->getResult();

        $data = array_map(fn (Product $p) => [
            'id' => $p->getId(),
            'name' => $p->getName(),
            'slug' => $p->getSlug(),
            'sku' => $p->getSku(),
            'stockQuantity' => $p->getStockQuantity(),
            'status' => $p->getStatus(),
            'category' => $p->getCategory()?->getName(),
        ], $products);

        return $this->api->success($data);
    }
}
