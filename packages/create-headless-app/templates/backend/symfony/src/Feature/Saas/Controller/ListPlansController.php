<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Shared\Entity\Plan;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/plans', name: 'api_v1_saas_plans_list', methods: ['GET'])]
class ListPlansController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(): JsonResponse
    {
        $plans = $this->em->getRepository(Plan::class)->findBy([], ['priceMonthly' => 'ASC']);

        return $this->api->success(array_map(fn (Plan $p) => $p->toArray(), $plans));
    }
}
