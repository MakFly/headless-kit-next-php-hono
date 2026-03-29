<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Dashboard
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
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

        $sub = $org->activeSubscription();
        $currentPlan = $sub ? [
            'id' => $sub->plan->id,
            'name' => $sub->plan->name,
            'slug' => $sub->plan->slug,
        ] : null;

        return $this->success([
            'activeMembers' => $activeMembers,
            'totalProjects' => (int) $projects,
            'apiCallsThisMonth' => (int) $apiCalls,
            'storageUsed' => (int) $storage,
            'currentPlan' => $currentPlan,
        ]);
    }
}
