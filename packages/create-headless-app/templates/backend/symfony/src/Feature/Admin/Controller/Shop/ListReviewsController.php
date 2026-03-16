<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Review;
use App\Shared\Repository\ReviewRepository;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/reviews', name: 'api_v1_admin_shop_reviews_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListReviewsController extends AbstractController
{
    public function __construct(
        private readonly ReviewRepository $reviewRepository,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $filters = $request->query->all();
        $reviews = $this->reviewRepository->findAllFiltered($filters);
        $total = $this->reviewRepository->countFiltered($filters);

        $page = max(1, (int) ($filters['page'] ?? 1));
        $perPage = min(100, max(1, (int) ($filters['per_page'] ?? 20)));

        return $this->api->paginated(
            array_map(fn (Review $r) => $r->toArray(), $reviews),
            $page,
            $perPage,
            $total
        );
    }
}
