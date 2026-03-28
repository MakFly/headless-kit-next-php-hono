<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\Conversation;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/queue', name: 'api_v1_support_agent_queue', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class AgentQueueController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $conversations = $this->em->getRepository(Conversation::class)->findBy(
            ['status' => 'open', 'agent' => null],
            ['createdAt' => 'ASC'],
        );

        return $this->api->success(array_map(fn (Conversation $c) => $c->toArray(), $conversations));
    }
}
