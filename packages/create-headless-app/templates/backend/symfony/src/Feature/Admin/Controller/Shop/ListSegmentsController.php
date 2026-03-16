<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Feature\Admin\Service\SegmentQueryService;
use App\Shared\Entity\Segment;
use App\Shared\Repository\SegmentRepository;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/segments', name: 'api_v1_admin_shop_segments_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListSegmentsController extends AbstractController
{
    public function __construct(
        private readonly SegmentRepository $segmentRepository,
        private readonly SegmentQueryService $segmentQueryService,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $segments = $this->segmentRepository->findBy([], ['name' => 'ASC']);

        $data = array_map(function (Segment $segment) {
            $count = $this->segmentQueryService->computeCount($segment);
            $arr = $segment->toArray();
            $arr['customerCount'] = $count;

            return $arr;
        }, $segments);

        return $this->api->success($data);
    }
}
