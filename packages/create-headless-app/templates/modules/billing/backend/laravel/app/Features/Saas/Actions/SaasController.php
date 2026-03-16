<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponder;
use App\Shared\Models\Invoice;
use App\Shared\Models\Organization;
use App\Shared\Models\Plan;
use App\Shared\Models\Subscription;
use App\Shared\Models\TeamMember;
use App\Shared\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SaasController extends Controller
{
    use ApiResponder;

    // =========================================================================
    // Plans (public)
    // =========================================================================

    public function listPlans(): JsonResponse
    {
        $plans = Plan::orderBy('price_monthly')->get()->map(fn ($p) => [
            'id'           => $p->id,
            'name'         => $p->name,
            'slug'         => $p->slug,
            'priceMonthly' => $p->price_monthly,
            'priceYearly'  => $p->price_yearly,
            'features'     => $p->features ?? [],
            'limits'       => $p->limits ?? [],
        ]);

        return $this->success($plans);
    }

    // =========================================================================
    // Subscription
    // =========================================================================

    public function getSubscription(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        $sub = $org->activeSubscription();

        if ($sub === null) {
            return $this->success(null);
        }

        return $this->success($this->formatSubscription($sub->load('plan')));
    }

    public function subscribe(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        $validated = $request->validate([
            'plan_slug' => ['required', 'string'],
        ]);

        $plan = Plan::where('slug', $validated['plan_slug'])->first();
        if ($plan === null) {
            return $this->error('NOT_FOUND', __('api.saas.plan_not_found'), 404);
        }

        if ($org->activeSubscription() !== null) {
            return $this->error('CONFLICT', __('api.saas.already_subscribed'), 409);
        }

        $now = now();
        $sub = Subscription::create([
            'organization_id'      => $org->id,
            'plan_id'              => $plan->id,
            'status'               => 'active',
            'current_period_start' => $now,
            'current_period_end'   => $now->copy()->addDays(30),
        ]);

        Invoice::create([
            'organization_id' => $org->id,
            'amount'          => $plan->price_monthly,
            'status'          => 'pending',
            'period_start'    => $sub->current_period_start,
            'period_end'      => $sub->current_period_end,
        ]);

        $org->update(['plan_id' => $plan->id]);

        return $this->created($this->formatSubscription($sub->load('plan')));
    }

    public function cancelSubscription(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        $sub = $org->activeSubscription();
        if ($sub === null) {
            return $this->error('NOT_FOUND', __('api.saas.no_active_subscription'), 404);
        }

        $sub->update(['status' => 'cancelled']);

        return $this->success($this->formatSubscription($sub->load('plan')));
    }

    // =========================================================================
    // Invoices
    // =========================================================================

    public function listInvoices(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        $invoices = $org->invoices()->orderByDesc('created_at')->get()->map(fn ($inv) => [
            'id'          => $inv->id,
            'amount'      => $inv->amount,
            'status'      => $inv->status,
            'periodStart' => $inv->period_start,
            'periodEnd'   => $inv->period_end,
            'paidAt'      => $inv->paid_at,
        ]);

        return $this->success($invoices);
    }

    // =========================================================================
    // Dashboard
    // =========================================================================

    public function dashboard(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        $activeMembers = $org->teamMembers()->count();

        $apiCalls = $org->usageRecords()
            ->where('metric', 'api_calls')
            ->whereMonth('recorded_at', now()->month)
            ->sum('value');

        $storage = $org->usageRecords()
            ->where('metric', 'storage')
            ->latest('recorded_at')
            ->value('value') ?? 0;

        $projects = $org->usageRecords()
            ->where('metric', 'projects')
            ->latest('recorded_at')
            ->value('value') ?? 0;

        $sub         = $org->activeSubscription();
        $currentPlan = $sub ? [
            'id'   => $sub->plan->id,
            'name' => $sub->plan->name,
            'slug' => $sub->plan->slug,
        ] : null;

        return $this->success([
            'activeMembers'     => $activeMembers,
            'totalProjects'     => (int) $projects,
            'apiCallsThisMonth' => (int) $apiCalls,
            'storageUsed'       => (int) $storage,
            'currentPlan'       => $currentPlan,
        ]);
    }

    // =========================================================================
    // Settings
    // =========================================================================

    public function getSettings(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        return $this->success([
            'organizationName' => $org->name,
            'slug'             => $org->slug,
        ]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        $validated = $request->validate([
            'organizationName' => ['sometimes', 'string', 'max:255'],
            'slug'             => ['sometimes', 'string', 'regex:/^[a-z0-9-]+$/', 'unique:organizations,slug,' . $org->id],
        ]);

        $update = [];
        if (isset($validated['organizationName'])) {
            $update['name'] = $validated['organizationName'];
        }
        if (isset($validated['slug'])) {
            $update['slug'] = $validated['slug'];
        }

        if (! empty($update)) {
            $org->update($update);
            $org->refresh();
        }

        return $this->success([
            'organizationName' => $org->name,
            'slug'             => $org->slug,
        ]);
    }

    // =========================================================================
    // Helpers
    // =========================================================================

    private function formatSubscription(Subscription $sub): array
    {
        return [
            'id'                 => $sub->id,
            'plan'               => $sub->relationLoaded('plan') && $sub->plan ? [
                'id'           => $sub->plan->id,
                'name'         => $sub->plan->name,
                'slug'         => $sub->plan->slug,
                'priceMonthly' => $sub->plan->price_monthly,
                'priceYearly'  => $sub->plan->price_yearly,
            ] : null,
            'status'             => $sub->status,
            'currentPeriodStart' => $sub->current_period_start,
            'currentPeriodEnd'   => $sub->current_period_end,
        ];
    }
}
