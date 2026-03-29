<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/settings', name: 'api_v1_saas_settings_get', methods: ['GET'])]
class GetSettingsController extends AbstractController
{
    public function __construct(
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
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        return $this->api->success([
            'name' => $org->getName(),
            'slug' => $org->getSlug(),
        ]);
    }
}
