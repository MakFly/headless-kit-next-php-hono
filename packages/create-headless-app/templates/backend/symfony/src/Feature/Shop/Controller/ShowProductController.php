<?php

declare(strict_types=1);

namespace App\Feature\Shop\Controller;

use App\Feature\Shop\Repository\ProductRepository;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/products/{slug}', name: 'api_v1_products_detail', methods: ['GET'])]
class ShowProductController extends AbstractController
{
    public function __construct(
        private readonly ProductRepository $productRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $slug): JsonResponse
    {
        $product = $this->productRepository->findBySlug($slug);

        if ($product === null) {
            return $this->api->error('NOT_FOUND', 'shop.product_not_found', 404);
        }

        return $this->api->success($product->toArray());
    }
}
