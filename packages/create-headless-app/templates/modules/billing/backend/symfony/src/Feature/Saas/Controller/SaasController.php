<?php

declare(strict_types=1);

namespace App\Feature\Saas\Controller;

use App\Shared\Entity\Invoice;
use App\Shared\Entity\Organization;
use App\Shared\Entity\Plan;
use App\Shared\Entity\Subscription;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\UsageRecord;
use App\Shared\Entity\User;
use App\Shared\Security\OrgVoter;
use App\Shared\Service\ApiResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class SaasController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApiResponseService $api,
    ) {
    }

    // =========================================================================
    // Plans (public)
    // =========================================================================

    #[Route('/api/v1/saas/plans', name: 'api_v1_saas_plans_list', methods: ['GET'])]
    public function listPlans(): JsonResponse
    {
        $plans = $this->em->getRepository(Plan::class)->findBy([], ['priceMonthly' => 'ASC']);

        return $this->api->success(array_map(fn (Plan $p) => $p->toArray(), $plans));
    }

    // =========================================================================
    // Dashboard (ORG_VIEW)
    // =========================================================================

    #[Route('/api/v1/saas/orgs/{orgId}/dashboard', name: 'api_v1_saas_dashboard', methods: ['GET'])]
    public function dashboard(string $orgId): JsonResponse
    {
        $org = $this->loadOrg($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_VIEW, $org);

        $activeMembers = $this->em->getRepository(TeamMember::class)->count(['organization' => $org]);

        $usageRepo = $this->em->getRepository(UsageRecord::class);
        $projectsRecord = $usageRepo->findOneBy(['organization' => $org, 'metric' => 'projects'], ['recordedAt' => 'DESC']);
        $apiCallsRecord = $usageRepo->findOneBy(['organization' => $org, 'metric' => 'api_calls'], ['recordedAt' => 'DESC']);
        $storageRecord = $usageRepo->findOneBy(['organization' => $org, 'metric' => 'storage'], ['recordedAt' => 'DESC']);

        $subscription = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);

        return $this->api->success([
            'activeMembers' => $activeMembers,
            'totalProjects' => $projectsRecord?->getValue() ?? 0,
            'apiCallsThisMonth' => $apiCallsRecord?->getValue() ?? 0,
            'storageUsed' => $storageRecord?->getValue() ?? 0,
            'currentPlan' => $subscription?->getPlan()->toArray(),
        ]);
    }

    // =========================================================================
    // Subscription
    // =========================================================================

    #[Route('/api/v1/saas/orgs/{orgId}/subscription', name: 'api_v1_saas_subscription_get', methods: ['GET'])]
    public function getSubscription(string $orgId): JsonResponse
    {
        $org = $this->loadOrg($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_MEMBER, $org);

        $subscription = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);

        if (!$subscription) {
            return $this->api->error('NOT_FOUND', 'saas.no_active_subscription', 404);
        }

        return $this->api->success($subscription->toArray());
    }

    #[Route('/api/v1/saas/orgs/{orgId}/subscription', name: 'api_v1_saas_subscription_create', methods: ['POST'])]
    public function subscribe(string $orgId, Request $request): JsonResponse
    {
        $org = $this->loadOrg($orgId);
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
        $subscription->setCurrentPeriodEnd(new \DateTimeImmutable('+1 month'));

        $this->em->persist($subscription);

        $invoice = new Invoice();
        $invoice->setOrganization($org);
        $invoice->setAmount($plan->getPriceMonthly());
        $invoice->setStatus('paid');
        $invoice->setPeriodStart(new \DateTimeImmutable());
        $invoice->setPeriodEnd(new \DateTimeImmutable('+1 month'));
        $invoice->setPaidAt(new \DateTimeImmutable());

        $this->em->persist($invoice);
        $this->em->flush();

        return $this->api->success($subscription->toArray(), 201);
    }

    #[Route('/api/v1/saas/orgs/{orgId}/subscription', name: 'api_v1_saas_subscription_cancel', methods: ['DELETE'])]
    public function cancelSubscription(string $orgId): JsonResponse
    {
        $org = $this->loadOrg($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_OWNER, $org);

        $subscription = $this->em->getRepository(Subscription::class)->findOneBy([
            'organization' => $org,
            'status' => 'active',
        ]);

        if (!$subscription) {
            return $this->api->error('NOT_FOUND', 'saas.no_active_subscription', 404);
        }

        $subscription->setStatus('cancelled');
        $this->em->flush();

        return $this->api->success($subscription->toArray());
    }

    // =========================================================================
    // Invoices
    // =========================================================================

    #[Route('/api/v1/saas/orgs/{orgId}/invoices', name: 'api_v1_saas_invoices_list', methods: ['GET'])]
    public function listInvoices(string $orgId): JsonResponse
    {
        $org = $this->loadOrg($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        $invoices = $this->em->getRepository(Invoice::class)->findBy(
            ['organization' => $org],
            ['createdAt' => 'DESC'],
        );

        return $this->api->success(array_map(fn (Invoice $i) => $i->toArray(), $invoices));
    }

    // =========================================================================
    // Settings
    // =========================================================================

    #[Route('/api/v1/saas/orgs/{orgId}/settings', name: 'api_v1_saas_settings_get', methods: ['GET'])]
    public function getSettings(string $orgId): JsonResponse
    {
        $org = $this->loadOrg($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        return $this->api->success([
            'name' => $org->getName(),
            'slug' => $org->getSlug(),
        ]);
    }

    #[Route('/api/v1/saas/orgs/{orgId}/settings', name: 'api_v1_saas_settings_update', methods: ['PATCH'])]
    public function updateSettings(string $orgId, Request $request): JsonResponse
    {
        $org = $this->loadOrg($orgId);
        if ($org instanceof JsonResponse) {
            return $org;
        }
        $this->denyAccessUnlessGranted(OrgVoter::ORG_ADMIN, $org);

        $data = json_decode($request->getContent(), true) ?? [];

        if (isset($data['name'])) {
            $org->setName($data['name']);
        }
        if (isset($data['slug'])) {
            $existing = $this->em->getRepository(Organization::class)->findOneBy(['slug' => $data['slug']]);
            if ($existing && $existing->getId() !== $org->getId()) {
                return $this->api->error('CONFLICT', 'saas.org_slug_exists', 409);
            }
            $org->setSlug($data['slug']);
        }

        $this->em->flush();

        return $this->api->success([
            'name' => $org->getName(),
            'slug' => $org->getSlug(),
        ]);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private function loadOrg(string $orgId): Organization|JsonResponse
    {
        $org = $this->em->getRepository(Organization::class)->find($orgId);
        if (!$org) {
            return $this->api->error('NOT_FOUND', 'saas.org_not_found', 404);
        }

        return $org;
    }
}
