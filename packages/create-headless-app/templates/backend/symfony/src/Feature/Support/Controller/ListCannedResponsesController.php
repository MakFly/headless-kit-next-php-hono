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

#[Route('/api/v1/support/agent/canned', name: 'api_v1_support_agent_canned_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListCannedResponsesController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $responses = $this->em->getRepository(CannedResponse::class)->findBy([], ['title' => 'ASC']);

        return $this->api->success(array_map(fn (CannedResponse $r) => $r->toArray(), $responses));
    }
}
