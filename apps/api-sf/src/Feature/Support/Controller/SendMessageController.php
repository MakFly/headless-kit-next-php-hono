<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Feature\Support\Service\ConversationAccessChecker;
use App\Shared\Entity\ChatMessage;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/support/conversations/{id}/messages', name: 'api_v1_support_conversations_send_message', methods: ['POST'])]
class SendMessageController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ConversationAccessChecker $accessChecker,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id, Request $request): JsonResponse
    {
        $conversation = $this->accessChecker->findForUser($id);
        if ($conversation instanceof JsonResponse) {
            return $conversation;
        }

        if ($conversation->getStatus() === 'closed') {
            return $this->api->error('VALIDATION_ERROR', 'support.conversation_closed', 422);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        if (empty($data['content'])) {
            return $this->api->error('VALIDATION_ERROR', 'support.content_required', 400);
        }

        /** @var User $user */
        $user = $this->getUser();

        $message = new ChatMessage();
        $message->setConversation($conversation);
        $message->setSenderId($user->getId());
        $message->setSenderType('user');
        $message->setContent($data['content']);
        $conversation->setLastMessageAt($message->getCreatedAt());

        $this->em->persist($message);
        $this->em->flush();

        return $this->api->success($message->toArray(), 201);
    }
}
