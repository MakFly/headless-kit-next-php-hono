<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Shared\Entity\TeamMember;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs', name: 'api_v1_saas_orgs_list', methods: ['GET'])]
class ListOrgsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $memberships = $this->em->getRepository(TeamMember::class)->findBy(['user' => $user]);

        $data = array_map(static function (TeamMember $m): array {
            return array_merge($m->getOrganization()->toArray(), ['role' => $m->getRole()]);
        }, $memberships);

        return $this->api->success($data);
    }
}
