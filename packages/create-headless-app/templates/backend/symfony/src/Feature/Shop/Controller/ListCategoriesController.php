<?php

declare(strict_types=1);

namespace App\Feature\Shop\Controller;

use App\Feature\Shop\Repository\CategoryRepository;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/categories', name: 'api_v1_categories_list', methods: ['GET'])]
class ListCategoriesController extends AbstractController
{
    public function __construct(
        private readonly CategoryRepository $categoryRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $results = $this->categoryRepository->findAllWithProductCount();

        $data = array_map(fn (array $row) => [
            ...$row['category']->toArray(),
            'productCount' => $row['productCount'],
        ], $results);

        return $this->api->success($data);
    }
}
