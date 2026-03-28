<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\Conversation;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/conversations/{id}/status', name: 'api_v1_support_agent_status', methods: ['PATCH'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateConversationStatusController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id, Request $request): JsonResponse
    {
        $conversation = $this->em->getRepository(Conversation::class)->find($id);
        if (!$conversation) {
            return $this->api->error('NOT_FOUND', 'support.conversation_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $status = $data['status'] ?? null;

        if (!$status || !in_array($status, ['open', 'assigned', 'waiting', 'resolved', 'closed'])) {
            return $this->api->error('VALIDATION_ERROR', 'support.invalid_status', 400);
        }

        $conversation->setStatus($status);
        $this->em->flush();

        return $this->api->success($conversation->toArray());
    }
}
