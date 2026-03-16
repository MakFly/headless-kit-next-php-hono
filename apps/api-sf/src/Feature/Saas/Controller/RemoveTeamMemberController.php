<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\TeamMember;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/team/{id}', name: 'api_v1_saas_team_remove', methods: ['DELETE'])]
class RemoveTeamMemberController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OrgLoader $orgLoader,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $orgId, string $id): JsonResponse
    {
        $org = $this->orgLoader->load($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        $member = $this->em->getRepository(TeamMember::class)->find($id);
        if (!$member || $member->getOrganization()->getId() !== $org->getId()) {
            return $this->api->error('NOT_FOUND', 'saas.member_not_found', 404);
        }

        if ($member->getRole() === 'owner') {
            return $this->api->error('ACCESS_DENIED', 'saas.cannot_remove_owner', 403);
        }

        $this->em->remove($member);
        $this->em->flush();

        return $this->api->success(['message' => 'saas.member_removed']);
    }
}
