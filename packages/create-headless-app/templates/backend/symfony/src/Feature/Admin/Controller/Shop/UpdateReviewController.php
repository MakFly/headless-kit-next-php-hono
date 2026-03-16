<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Review;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/reviews/{id}', name: 'api_v1_admin_shop_reviews_update', methods: ['PUT'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateReviewController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $review = $this->em->getRepository(Review::class)->find($id);
        if ($review === null) {
            return $this->api->error('NOT_FOUND', 'shop.review_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['status'])) {
            $validStatuses = ['pending', 'approved', 'rejected'];
            if (!in_array($data['status'], $validStatuses, true)) {
                return $this->api->error('VALIDATION_ERROR', 'shop.review_invalid_status', 400);
            }
            $review->setStatus($data['status']);
        }
        if (isset($data['title'])) {
            $review->setTitle($data['title']);
        }
        if (isset($data['comment'])) {
            $review->setComment($data['comment']);
        }

        $this->em->flush();

        return $this->api->success($review->toArray());
    }
}
