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

#[Route('/api/v1/admin/customers', name: 'api_v1_admin_shop_customers_list', methods: ['GET'])]
#[IsGranted('ROLE_CHECK_admin')]
class ListCustomersController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $qb = $this->em->createQueryBuilder()
            ->select('u')
            ->from(User::class, 'u');

        if ($search = $request->query->get('search')) {
            $qb->andWhere('u.email LIKE :search OR u.username LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }

        $qb->orderBy('u.createdAt', 'DESC');

        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = min(100, max(1, (int) $request->query->get('per_page', 20)));
        $qb->setFirstResult(($page - 1) * $perPage)->setMaxResults($perPage);

        $users = $qb->getQuery()->getResult();

        $countQb = $this->em->createQueryBuilder()
            ->select('COUNT(u2.id)')
            ->from(User::class, 'u2');
        if ($search) {
            $countQb->andWhere('u2.email LIKE :search OR u2.username LIKE :search')
                ->setParameter('search', '%' . $search . '%');
        }
        $total = (int) $countQb->getQuery()->getSingleScalarResult();

        $data = array_map(fn (User $u) => [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'username' => $u->getUsername(),
            'emailVerified' => $u->isEmailVerified(),
            'createdAt' => $u->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt' => $u->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ], $users);

        return $this->api->paginated($data, $page, $perPage, $total);
    }
}
