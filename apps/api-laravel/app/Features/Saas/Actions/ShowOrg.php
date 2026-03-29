<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowOrg
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
        $org = $request->attributes->get('org');

        /** @var \App\Shared\Models\TeamMember $membership */
        $membership = $request->attributes->get('orgMembership');

        $org->load('plan');

        $sub = $org->activeSubscription()?->load('plan');

        return $this->success([
            'id' => $org->id,
            'name' => $org->name,
            'slug' => $org->slug,
            'role' => $membership->role,
            'plan' => $org->plan ? [
                'name' => $org->plan->name,
                'slug' => $org->plan->slug,
            ] : null,
            'subscription' => $sub ? [
                'status' => $sub->status,
                'currentPeriodEnd' => $sub->current_period_end,
            ] : null,
            'membersCount' => $org->teamMembers()->count(),
        ]);
    }
}
