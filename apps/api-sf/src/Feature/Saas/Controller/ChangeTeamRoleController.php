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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/team/{id}/role', name: 'api_v1_saas_team_update_role', methods: ['PATCH'])]
class ChangeTeamRoleController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OrgLoader $orgLoader,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $orgId, string $id, Request $request): JsonResponse
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
            return $this->api->error('ACCESS_DENIED', 'saas.cannot_change_owner_role', 403);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        if (empty($data['role']) || !\in_array($data['role'], ['admin', 'member', 'viewer'], true)) {
            return $this->api->error('VALIDATION_ERROR', 'saas.invalid_role', 400);
        }

        $member->setRole($data['role']);
        $this->em->flush();

        return $this->api->success($member->toArray());
    }
}
