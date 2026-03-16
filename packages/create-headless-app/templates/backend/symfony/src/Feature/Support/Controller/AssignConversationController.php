<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\Conversation;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/conversations/{id}/assign', name: 'api_v1_support_agent_assign', methods: ['PATCH'])]
#[IsGranted('ROLE_CHECK_admin')]
class AssignConversationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $conversation = $this->em->getRepository(Conversation::class)->find($id);
        if (!$conversation) {
            return $this->api->error('NOT_FOUND', 'support.conversation_not_found', 404);
        }

        if ($conversation->getAgent() !== null) {
            return $this->api->error('CONFLICT', 'support.conversation_already_assigned', 409);
        }

        /** @var User $user */
        $user = $this->getUser();

        $conversation->setAgent($user);
        $conversation->setStatus('assigned');
        $this->em->flush();

        return $this->api->success($conversation->toArray());
    }
}
