<?php

declare(strict_types=1);

namespace App\Feature\Saas\Service;

use App\Shared\Entity\Organization;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

class OrgLoader
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function load(string $orgId): Organization|JsonResponse
    {
        $org = $this->em->getRepository(Organization::class)->find($orgId);
        if (!$org) {
            return $this->api->error('NOT_FOUND', 'saas.org_not_found', 404);
        }

        return $org;
    }
}
