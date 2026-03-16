<?php

declare(strict_types=1);

namespace App\Feature\Org\Controller;

use App\Shared\Entity\Organization;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\User;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class OrgController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    #[Route('/api/v1/saas/orgs', name: 'api_v1_saas_orgs_list', methods: ['GET'])]
    public function listOrgs(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $memberships = $this->em->getRepository(TeamMember::class)->findBy(['user' => $user]);

        $data = array_map(static function (TeamMember $m): array {
            return array_merge($m->getOrganization()->toArray(), ['role' => $m->getRole()]);
        }, $memberships);

        return $this->api->success($data);
    }

    #[Route('/api/v1/saas/orgs', name: 'api_v1_saas_orgs_create', methods: ['POST'])]
    public function createOrg(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['name'])) {
            return $this->api->error('VALIDATION_ERROR', 'saas.org_name_required', 400);
        }

        if (empty($data['slug'])) {
            return $this->api->error('VALIDATION_ERROR', 'saas.org_slug_required', 400);
        }

        $slug = $data['slug'];
        $existing = $this->em->getRepository(Organization::class)->findOneBy(['slug' => $slug]);
        if ($existing) {
            return $this->api->error('CONFLICT', 'saas.org_slug_taken', 409);
        }

        $org = new Organization();
        $org->setName($data['name']);
        $org->setSlug($slug);
        $org->setOwner($user);

        $ownerMember = new TeamMember();
        $ownerMember->setUser($user);
        $ownerMember->setRole('owner');
        $org->addTeamMember($ownerMember);

        $this->em->persist($org);
        $this->em->flush();

        return $this->api->success(array_merge($org->toArray(), ['role' => 'owner']), 201);
    }

    #[Route('/api/v1/saas/orgs/{orgId}', name: 'api_v1_saas_orgs_show', methods: ['GET'])]
    public function showOrg(string $orgId): JsonResponse
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
