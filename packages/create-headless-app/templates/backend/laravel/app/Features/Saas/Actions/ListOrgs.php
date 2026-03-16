<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListOrgs
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        $memberships = $user->teamMemberships()
            ->with('organization.plan')
            ->get();

        $orgs = $memberships->map(fn ($m) => [
            'id'   => $m->organization->id,
            'name' => $m->organization->name,
            'slug' => $m->organization->slug,
            'role' => $m->role,
            'plan' => $m->organization->plan ? [
                'name' => $m->organization->plan->name,
                'slug' => $m->organization->plan->slug,
            ] : null,
        ]);

        return $this->success($orgs);
    }
}
