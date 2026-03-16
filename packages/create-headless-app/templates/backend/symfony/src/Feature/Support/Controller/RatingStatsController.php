<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\Conversation;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/ratings', name: 'api_v1_support_agent_ratings', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class RatingStatsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $qb = $this->em->createQueryBuilder();
        $qb->select('AVG(c.rating) as average, COUNT(c.rating) as total')
            ->from(Conversation::class, 'c')
            ->where('c.rating IS NOT NULL');

        $result = $qb->getQuery()->getSingleResult();

        $distQb = $this->em->createQueryBuilder();
        $distQb->select('c.rating, COUNT(c.id) as count')
            ->from(Conversation::class, 'c')
            ->where('c.rating IS NOT NULL')
            ->groupBy('c.rating')
            ->orderBy('c.rating', 'ASC');

        $distribution = [];
        foreach ($distQb->getQuery()->getArrayResult() as $row) {
            $distribution[$row['rating']] = (int) $row['count'];
        }

        return $this->api->success([
            'average' => $result['average'] ? round((float) $result['average'], 2) : null,
            'total' => (int) $result['total'],
            'distribution' => $distribution,
        ]);
    }
}
