<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\CannedResponse;
use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/canned', name: 'api_v1_support_agent_canned_create', methods: ['POST'])]
#[IsGranted('ROLE_CHECK_admin')]
class CreateCannedResponseController extends AbstractController
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

        if (empty($data['title']) || empty($data['content'])) {
            return $this->api->error('VALIDATION_ERROR', 'support.canned_title_content_required', 400);
        }

        $response = new CannedResponse();
        $response->setTitle($data['title']);
        $response->setContent($data['content']);
        $response->setCreatedBy($user->getId());

        if (!empty($data['category'])) {
            $response->setCategory($data['category']);
        }
        if (!empty($data['shortcut'])) {
            $response->setShortcut($data['shortcut']);
        }

        $this->em->persist($response);
        $this->em->flush();

        return $this->api->success($response->toArray(), 201);
    }
}
