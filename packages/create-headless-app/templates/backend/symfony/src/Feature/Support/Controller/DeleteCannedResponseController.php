<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\CannedResponse;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/canned/{id}', name: 'api_v1_support_agent_canned_delete', methods: ['DELETE'])]
#[IsGranted('ROLE_CHECK_admin')]
class DeleteCannedResponseController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $response = $this->em->getRepository(CannedResponse::class)->find($id);
        if (!$response) {
            return $this->api->error('NOT_FOUND', 'support.canned_response_not_found', 404);
        }

        $this->em->remove($response);
        $this->em->flush();

        return $this->api->success(['message' => 'support.canned_response_deleted']);
    }
}
