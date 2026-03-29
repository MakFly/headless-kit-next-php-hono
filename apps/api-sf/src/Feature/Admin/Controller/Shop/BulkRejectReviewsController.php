<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\Review;
use App\Shared\Service\ApiResponseService;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/reviews/bulk-reject', name: 'api_v1_admin_shop_reviews_bulk_reject', methods: ['POST'])]
#[IsGranted('ROLE_CHECK_admin')]
class BulkRejectReviewsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];
        $ids = $data['ids'] ?? [];

        if (empty($ids) || !\is_array($ids)) {
            return $this->api->error('VALIDATION_ERROR', 'shop.review_ids_required', 400);
        }

        $updated = $this->em->createQueryBuilder()
            ->update(Review::class, 'r')
            ->set('r.status', ':status')
            ->set('r.updatedAt', ':now')
            ->where('r.id IN (:ids)')
            ->setParameter('status', 'rejected')
            ->setParameter('now', new DateTimeImmutable())
            ->setParameter('ids', $ids)
            ->getQuery()->execute();

        return $this->api->success(['updated' => $updated]);
    }
}
