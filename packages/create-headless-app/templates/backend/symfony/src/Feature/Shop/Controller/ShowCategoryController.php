<?php

declare(strict_types=1);

namespace App\Feature\Shop\Controller;

use App\Feature\Shop\Repository\CategoryRepository;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/categories/{slug}', name: 'api_v1_categories_detail', methods: ['GET'])]
class ShowCategoryController extends AbstractController
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $slug): JsonResponse
    {
        $result = $this->categoryRepository->findBySlugWithProducts($slug);

        if ($result === null) {
            return $this->api->error('NOT_FOUND', 'shop.category_not_found', 404);
        }

        $data = $result['category']->toArray();
        $data['products'] = array_map(fn ($p) => $p->toArray(), $result['products']);

        return $this->api->success($data);
    }
}
