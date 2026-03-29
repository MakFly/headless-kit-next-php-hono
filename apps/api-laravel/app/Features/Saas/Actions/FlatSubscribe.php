<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Formatters\SubscriptionFormatter;
use App\Shared\Models\Invoice;
use App\Shared\Models\Organization;
use App\Shared\Models\Plan;
use App\Shared\Models\Subscription;
use App\Shared\Models\TeamMember;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class FlatSubscribe
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'plan_slug' => ['required', 'string'],
        ]);

        $plan = Plan::where('slug', $validated['plan_slug'])->first();
        if ($plan === null) {
            return $this->error('NOT_FOUND', __('api.saas.plan_not_found'), 404);
        }

        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        // Auto-create an org for the user if none exists
        $org = Organization::where('owner_id', $user->id)->first();
        if ($org === null) {
            $org = Organization::create([
                'name' => $user->name.'\'s Organization',
                'slug' => Str::slug($user->name).'-'.Str::lower(Str::random(6)),
                'owner_id' => $user->id,
            ]);

            TeamMember::create([
                'organization_id' => $org->id,
                'user_id' => $user->id,
                'role' => 'owner',
                'joined_at' => now(),
            ]);
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
