<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\Subscription;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/subscription', name: 'api_v1_saas_subscription_get', methods: ['GET'])]
class GetSubscriptionController extends AbstractController
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
        $this->denyAccessUnlessGranted(OrgVoter::ORG_MEMBER, $org);

        $subscription = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);

        if (!$subscription) {
            return $this->api->error('NOT_FOUND', 'saas.no_active_subscription', 404);
        }

        return $this->api->success($subscription->toArray());
    }
}
