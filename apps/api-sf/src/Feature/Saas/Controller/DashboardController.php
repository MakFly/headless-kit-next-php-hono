<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\Subscription;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\UsageRecord;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/dashboard', name: 'api_v1_saas_dashboard', methods: ['GET'])]
class DashboardController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OrgLoader $orgLoader,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $orgId): JsonResponse
    {
        $org = $this->orgLoader->load($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_VIEW, $org);

        $activeMembers = $this->em->getRepository(TeamMember::class)->count(['organization' => $org]);

        $usageRepo = $this->em->getRepository(UsageRecord::class);
        $projectsRecord = $usageRepo->findOneBy(['organization' => $org, 'metric' => 'projects'], ['recordedAt' => 'DESC']);
        $apiCallsRecord = $usageRepo->findOneBy(['organization' => $org, 'metric' => 'api_calls'], ['recordedAt' => 'DESC']);
        $storageRecord = $usageRepo->findOneBy(['organization' => $org, 'metric' => 'storage'], ['recordedAt' => 'DESC']);

        $subscription = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);

        return $this->api->success([
            'activeMembers' => $activeMembers,
            'totalProjects' => $projectsRecord?->getValue() ?? 0,
            'apiCallsThisMonth' => $apiCallsRecord?->getValue() ?? 0,
            'storageUsed' => $storageRecord?->getValue() ?? 0,
            'currentPlan' => $subscription?->getPlan()->toArray(),
        ]);
    }
}
