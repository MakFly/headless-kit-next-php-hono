<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Feature\Support\Service\ConversationAccessChecker;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/support/conversations/{id}/rate', name: 'api_v1_support_conversations_rate', methods: ['POST'])]
class RateConversationController extends AbstractController
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

        if (!\in_array($conversation->getStatus(), ['resolved', 'closed'])) {
            return $this->api->error('VALIDATION_ERROR', 'support.conversation_not_resolved', 422);
        }

        if ($conversation->getRating() !== null) {
            return $this->api->error('CONFLICT', 'support.conversation_already_rated', 409);
        }

        $data = json_decode($request->getContent(), true) ?? [];
        $rating = $data['rating'] ?? null;

        if (!\is_int($rating) || $rating < 1 || $rating > 5) {
            return $this->api->error('VALIDATION_ERROR', 'support.invalid_rating', 422);
        }

        $conversation->setRating($rating);
        $this->em->flush();

        return $this->api->success($conversation->toArray());
    }
}
