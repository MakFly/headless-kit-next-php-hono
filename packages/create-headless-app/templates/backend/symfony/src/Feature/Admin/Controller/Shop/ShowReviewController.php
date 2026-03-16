<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Review;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/reviews/{id}', name: 'api_v1_admin_shop_reviews_get', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ShowReviewController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $review = $this->em->getRepository(Review::class)->find($id);
        if ($review === null) {
            return $this->api->error('NOT_FOUND', 'shop.review_not_found', 404);
        }

        return $this->api->success($review->toArray());
    }
}
