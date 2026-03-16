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

#[Route('/api/v1/admin/customers', name: 'api_v1_admin_shop_customers_create', methods: ['POST'])]
#[IsGranted('ROLE_CHECK_admin')]
class CreateCustomerController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true) ?? [];

        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!$email || !$password) {
            return $this->api->error('VALIDATION_ERROR', 'admin.customer_email_password_required', 400);
        }

        $existing = $this->em->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existing !== null) {
            return $this->api->error('CONFLICT', 'admin.customer_email_exists', 409);
        }

        $user = new User();
        $user->setId(\Ramsey\Uuid\Uuid::uuid7()->toString());
        $user->setEmail($email);
        $user->setPassword(password_hash($password, \PASSWORD_ARGON2ID));
        if (isset($data['username'])) {
            $user->setUsername($data['username']);
        }
        $user->setCreatedAt(new \DateTimeImmutable());
        $user->setUpdatedAt(new \DateTimeImmutable());

        $this->em->persist($user);
        $this->em->flush();

        return $this->api->success([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'username' => $user->getUsername(),
            'createdAt' => $user->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], 201);
    }
}
