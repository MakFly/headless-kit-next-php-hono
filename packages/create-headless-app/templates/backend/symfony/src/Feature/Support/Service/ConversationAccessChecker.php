<?php

declare(strict_types=1);

namespace App\Feature\Support\Service;

use App\Shared\Entity\Conversation;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;

class ConversationAccessChecker
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
        private readonly Security $security,
    ) {
    }

    public function findForUser(string $id): Conversation|JsonResponse
    {
        $conversation = $this->em->getRepository(Conversation::class)->find($id);
        if (!$conversation) {
            return $this->api->error('NOT_FOUND', 'support.conversation_not_found', 404);
        }

        /** @var User $user */
        $user = $this->security->getUser();

        if ($conversation->getUser()->getId() !== $user->getId()) {
            return $this->api->error('ACCESS_DENIED', 'support.forbidden', 403);
        }

        return $conversation;
    }
}
