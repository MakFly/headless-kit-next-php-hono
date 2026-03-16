<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\Invoice;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/invoices', name: 'api_v1_saas_invoices_list', methods: ['GET'])]
class ListInvoicesController extends AbstractController
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
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        $invoices = $this->em->getRepository(Invoice::class)->findBy(
            ['organization' => $org],
            ['createdAt' => 'DESC'],
        );

        return $this->api->success(array_map(fn (Invoice $i) => $i->toArray(), $invoices));
    }
}
