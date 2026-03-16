<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\OrderItem;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/analytics/top-products', name: 'api_v1_admin_shop_analytics_top_products', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class TopProductsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $limit = min(50, max(1, (int) $request->query->get('limit', 10)));

        $results = $this->em->createQueryBuilder()
            ->select('p.id, p.name, p.slug, p.price, p.imageUrl, SUM(oi.quantity) as totalSold, SUM(oi.subtotal) as totalRevenue')
            ->from(OrderItem::class, 'oi')
            ->leftJoin('oi.product', 'p')
            ->where('p.id IS NOT NULL')
            ->groupBy('p.id, p.name, p.slug, p.price, p.imageUrl')
            ->orderBy('totalSold', 'DESC')
            ->setMaxResults($limit)
            ->getQuery()->getResult();

        $data = array_map(fn (array $row) => [
            'id' => $row['id'],
            'name' => $row['name'],
            'slug' => $row['slug'],
            'price' => $row['price'],
            'imageUrl' => $row['imageUrl'],
            'totalSold' => (int) $row['totalSold'],
            'totalRevenue' => (int) $row['totalRevenue'],
        ], $results);

        return $this->api->success($data);
    }
}
