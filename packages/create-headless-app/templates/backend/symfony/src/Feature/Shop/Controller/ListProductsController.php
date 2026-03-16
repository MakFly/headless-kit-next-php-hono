<?php

declare(strict_types=1);

namespace App\Feature\Shop\Controller;

use App\Feature\Shop\Repository\ProductRepository;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/products', name: 'api_v1_products_list', methods: ['GET'])]
class ListProductsController extends AbstractController
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $filters = [
            'category' => $request->query->get('category'),
            'search' => $request->query->get('search'),
            'sort' => $request->query->get('sort', 'newest'),
            'min_price' => $request->query->get('min_price'),
            'max_price' => $request->query->get('max_price'),
            'featured' => $request->query->get('featured'),
            'page' => $request->query->get('page', '1'),
            'per_page' => $request->query->get('per_page', '12'),
        ];

        $products = $this->productRepository->findAllFiltered($filters);
        $total = $this->productRepository->countFiltered($filters);

        $page = max(1, (int) $filters['page']);
        $perPage = min(100, max(1, (int) $filters['per_page']));

        return $this->api->paginated(
            array_map(fn ($p) => $p->toArray(), $products),
            $page,
            $perPage,
            $total
        );
    }
}
