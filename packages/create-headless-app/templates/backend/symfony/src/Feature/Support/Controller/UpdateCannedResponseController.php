<?php

declare(strict_types=1);

namespace App\Feature\Support\Controller;

use App\Shared\Entity\CannedResponse;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/support/agent/canned/{id}', name: 'api_v1_support_agent_canned_update', methods: ['PUT'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateCannedResponseController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $id, Request $request): JsonResponse
    {
        $response = $this->em->getRepository(CannedResponse::class)->find($id);
        if (!$response) {
            return $this->api->error('NOT_FOUND', 'support.canned_response_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['title'])) {
            $response->setTitle($data['title']);
        }
        if (isset($data['content'])) {
            $response->setContent($data['content']);
        }
        if (array_key_exists('category', $data)) {
            $response->setCategory($data['category']);
        }
        if (array_key_exists('shortcut', $data)) {
            $response->setShortcut($data['shortcut']);
        }

        $this->em->flush();

        return $this->api->success($response->toArray());
    }
}
