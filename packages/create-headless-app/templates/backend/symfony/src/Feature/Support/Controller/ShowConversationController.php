<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Feature\Support\Service\ConversationAccessChecker;
use App\Shared\Service\ApiResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/support/conversations/{id}', name: 'api_v1_support_conversations_get', methods: ['GET'])]
class ShowConversationController extends AbstractController
{
    public function __construct(
        private readonly ConversationAccessChecker $accessChecker,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id): JsonResponse
    {
        $conversation = $this->accessChecker->findForUser($id);
        if ($conversation instanceof JsonResponse) {
            return $conversation;
        }

        return $this->api->success($conversation->toArray(true));
    }
}
