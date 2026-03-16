<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Shared\Entity\Organization;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\User;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}', name: 'api_v1_saas_orgs_show', methods: ['GET'])]
class ShowOrgController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $orgId): JsonResponse
    {
        $org = $this->em->getRepository(Organization::class)->find($orgId);
        if (!$org) {
            return $this->api->error('NOT_FOUND', 'saas.org_not_found', 404);
        }

        $this->denyAccessUnlessGranted(OrgVoter::ORG_VIEW, $org);

        /** @var User $user */
        $user = $this->getUser();
        $member = $this->em->getRepository(TeamMember::class)->findOneBy([
            'organization' => $org,
            'user' => $user,
        ]);

        return $this->api->success(array_merge($org->toArray(), ['role' => $member?->getRole()]));
    }
}
