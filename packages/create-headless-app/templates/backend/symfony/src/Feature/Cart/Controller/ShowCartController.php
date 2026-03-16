<?php

declare(strict_types=1);

namespace App\Feature\Cart\Controller;

use App\Feature\Cart\Repository\CartRepository;
use App\Shared\Security\Trait\AuthenticatedUserTrait;
use App\Shared\Service\ApiResponseService;
use BetterAuth\Core\TokenManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/cart', name: 'api_v1_cart_show', methods: ['GET'])]
class ShowCartController extends AbstractController
{
    use AuthenticatedUserTrait;

    public function __construct(
        private readonly CartRepository $cartRepository,
        private readonly EntityManagerInterface $em,
        private readonly TokenManager $tokenManager,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $user = $this->getAuthenticatedUserOrFail($request);

        $cart = $this->cartRepository->findOrCreateForUser($user);

        return $this->api->success($cart->toArray());
    }
}
