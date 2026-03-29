<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Feature\Saas\Service\OrgLoader;
use App\Shared\Entity\Invoice;
use App\Shared\Entity\Plan;
use App\Shared\Entity\Subscription;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/saas/orgs/{orgId}/subscription', name: 'api_v1_saas_subscription_create', methods: ['POST'])]
class SubscribeController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly OrgLoader $orgLoader,
        private readonly ApiResponseService $api,
    ) {
    }

    public function __invoke(string $orgId, Request $request): JsonResponse
    {
        $org = $this->orgLoader->load($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_OWNER, $org);

        $data = json_decode($request->getContent(), true) ?? [];

        if (empty($data['planId'])) {
            return $this->api->error('VALIDATION_ERROR', 'saas.plan_id_required', 400);
        }

        $plan = $this->em->getRepository(Plan::class)->find($data['planId']);
        if (!$plan) {
            return $this->api->error('NOT_FOUND', 'saas.plan_not_found', 404);
        }

        $existing = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);
        if ($existing) {
            return $this->api->error('CONFLICT', 'saas.active_subscription_exists', 409);
        }

        $org->setPlan($plan);

        $subscription = new Subscription();
        $subscription->setOrganization($org);
        $subscription->setPlan($plan);
        $subscription->setStatus('active');
        $subscription->setCurrentPeriodEnd(new DateTimeImmutable('+1 month'));

        $this->em->persist($subscription);

        $invoice = new Invoice();
        $invoice->setOrganization($org);
        $invoice->setAmount($plan->getPriceMonthly());
        $invoice->setStatus('paid');
        $invoice->setPeriodStart(new DateTimeImmutable());
        $invoice->setPeriodEnd(new DateTimeImmutable('+1 month'));
        $invoice->setPaidAt(new DateTimeImmutable());

        $this->em->persist($invoice);
        $this->em->flush();

        return $this->api->success($subscription->toArray(), 201);
    }
}
