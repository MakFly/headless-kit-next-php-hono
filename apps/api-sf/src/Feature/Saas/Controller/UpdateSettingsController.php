<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\Organization;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/settings', name: 'api_v1_saas_settings_update', methods: ['PATCH'])]
class UpdateSettingsController extends AbstractController
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

        if (isset($data['name'])) {
            $org->setName($data['name']);
        }
        if (isset($data['slug'])) {
            $existing = $this->em->getRepository(Organization::class)->findOneBy(['slug' => $data['slug']]);
            if ($existing && $existing->getId() !== $org->getId()) {
                return $this->api->error('CONFLICT', 'saas.org_slug_exists', 409);
            }
            $org->setSlug($data['slug']);
        }

        $this->em->flush();

        return $this->api->success([
            'name' => $org->getName(),
            'slug' => $org->getSlug(),
        ]);
    }
}
