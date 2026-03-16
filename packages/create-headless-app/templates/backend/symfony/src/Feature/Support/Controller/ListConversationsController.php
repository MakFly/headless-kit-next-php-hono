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

#[Route('/api/v1/support/conversations', name: 'api_v1_support_conversations_list', methods: ['GET'])]
class ListConversationsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $conversations = $this->em->getRepository(Conversation::class)->findBy(
            ['user' => $user],
            ['updatedAt' => 'DESC'],
        );

        return $this->api->success(array_map(fn (Conversation $c) => $c->toArray(), $conversations));
    }
}
