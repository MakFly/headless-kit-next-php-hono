<?php

declare(strict_types=1);

namespace App\Features\Org\Actions;

use App\Http\Controllers\Controller;
use App\Http\Traits\ApiResponder;
use App\Shared\Models\Organization;
use App\Shared\Models\TeamMember;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class OrgController extends Controller
{
    use ApiResponder;

    public function listOrgs(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
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

    public function createOrg(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'regex:/^[a-z0-9-]+$/', 'unique:organizations,slug'],
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']) . '-' . Str::lower(Str::random(6));

        if (! isset($validated['slug'])) {
            while (Organization::where('slug', $slug)->exists()) {
                $slug = Str::slug($validated['name']) . '-' . Str::lower(Str::random(6));
            }
        }

        $org = Organization::create([
            'name'     => $validated['name'],
            'slug'     => $slug,
            'owner_id' => $user->id,
        ]);

        TeamMember::create([
            'organization_id' => $org->id,
            'user_id'         => $user->id,
            'role'            => 'owner',
            'joined_at'       => now(),
        ]);

        return $this->created([
            'id'   => $org->id,
            'name' => $org->name,
            'slug' => $org->slug,
            'role' => 'owner',
            'plan' => null,
        ]);
    }

    public function showOrg(Request $request): JsonResponse
    {
        /** @var \App\Models\Organization $org */
        $org = $request->attributes->get('org');

        /** @var \App\Models\TeamMember $membership */
        $membership = $request->attributes->get('orgMembership');

        $org->load('plan');

        $sub = $org->activeSubscription()?->load('plan');

        return $this->success([
            'id'           => $org->id,
            'name'         => $org->name,
            'slug'         => $org->slug,
            'role'         => $membership->role,
            'plan'         => $org->plan ? [
                'name' => $org->plan->name,
                'slug' => $org->plan->slug,
            ] : null,
            'subscription' => $sub ? [
                'status'           => $sub->status,
                'currentPeriodEnd' => $sub->current_period_end,
            ] : null,
            'membersCount' => $org->teamMembers()->count(),
        ]);
    }
}
