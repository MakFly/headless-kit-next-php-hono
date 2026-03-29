<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\ChatMessage;
use App\Shared\Entity\Conversation;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/support/conversations', name: 'api_v1_support_conversations_create', methods: ['POST'])]
class CreateConversationController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['subject']) || empty($data['message'])) {
            return $this->api->error('VALIDATION_ERROR', 'support.subject_message_required', 400);
        }

        $conversation = new Conversation();
        $conversation->setSubject($data['subject']);
        $conversation->setUser($user);

        if (!empty($data['priority']) && \in_array($data['priority'], ['low', 'medium', 'high', 'urgent'])) {
            $conversation->setPriority($data['priority']);
        }

        $this->em->persist($conversation);

        $message = new ChatMessage();
        $message->setConversation($conversation);
        $message->setSenderId($user->getId());
        $message->setSenderType('user');
        $message->setContent($data['message']);
        $conversation->setLastMessageAt($message->getCreatedAt());

        $this->em->persist($message);
        $this->em->flush();

        return $this->api->success($conversation->toArray(true), 201);
    }
}
