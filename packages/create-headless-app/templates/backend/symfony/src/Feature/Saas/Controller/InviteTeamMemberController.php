<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\Subscription;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\User;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/team/invite', name: 'api_v1_saas_team_invite', methods: ['POST'])]
class InviteTeamMemberController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OrgLoader $orgLoader,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $orgId, Request $request): JsonResponse
    {
        $org = $this->orgLoader->load($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        $data = json_decode($request->getContent(), true) ?? [];
        if (empty($data['email'])) {
            return $this->api->error('VALIDATION_ERROR', 'saas.email_required', 400);
        }

        $user = $this->em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
        if ($user) {
            $existing = $this->em->getRepository(TeamMember::class)->findOneBy([
                'organization' => $org,
                'user' => $user,
            ]);
            if ($existing) {
                return $this->api->error('CONFLICT', 'saas.member_already_exists', 409);
            }
        }

        $subscription = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);
        if ($subscription) {
            $limits = $subscription->getPlan()->getLimits();
            $maxMembers = $limits['maxMembers'] ?? -1;
            if ($maxMembers > 0) {
                $currentCount = $this->em->getRepository(TeamMember::class)->count(['organization' => $org]);
                if ($currentCount >= $maxMembers) {
                    return $this->api->error('VALIDATION_ERROR', 'saas.member_limit_reached', 422);
                }
            }
        }

        if (!$user) {
            return $this->api->error('NOT_FOUND', 'saas.user_not_found', 404);
        }

        $member = new TeamMember();
        $member->setUser($user);
        $member->setRole($data['role'] ?? 'member');
        $org->addTeamMember($member);

        $this->em->flush();

        return $this->api->success($member->toArray(), 201);
    }
}
