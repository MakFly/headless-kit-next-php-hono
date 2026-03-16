<?php

declare(strict_types=1);

namespace App\Feature\Admin\Controller\Shop;

use App\Shared\Entity\User;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1/admin/customers/{id}', name: 'api_v1_admin_shop_customers_update', methods: ['PUT'])]
#[IsGranted('ROLE_CHECK_admin')]
class UpdateCustomerController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $user = $this->em->getRepository(User::class)->find($id);
        if ($user === null) {
            return $this->api->error('NOT_FOUND', 'admin.customer_not_found', 404);
        }

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }
        if (isset($data['email'])) {
            $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $data['email']]);
            if ($existing !== null && $existing->getId() !== $id) {
                return $this->api->error('CONFLICT', 'admin.customer_email_in_use', 409);
            }
            $user->setEmail($data['email']);
        }

        $user->setUpdatedAt(new \DateTimeImmutable());
        $this->em->flush();

        return $this->api->success([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
        ]);
    }
}
