<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Formatters\SubscriptionFormatter;
use App\Shared\Models\Invoice;
use App\Shared\Models\Plan;
use App\Shared\Models\Subscription;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Subscribe
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
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
            'organization_id' => $org->id,
            'plan_id' => $plan->id,
            'status' => 'active',
            'current_period_start' => $now,
            'current_period_end' => $now->copy()->addDays(30),
        ]);

        Invoice::create([
            'organization_id' => $org->id,
            'amount' => $plan->price_monthly,
            'status' => 'pending',
            'period_start' => $sub->current_period_start,
            'period_end' => $sub->current_period_end,
        ]);

        $org->update(['plan_id' => $plan->id]);

        return $this->created(SubscriptionFormatter::format($sub->load('plan')));
    }
}
