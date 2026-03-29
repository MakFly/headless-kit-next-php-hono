<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Models\TeamMember;
use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatInviteTeamMember
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->error('NOT_FOUND', __('api.org.not_found'), 404);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', 'in:admin,member,viewer'],
        ]);

        $invitee = User::where('email', $validated['email'])->first();
        if ($invitee === null) {
            return $this->error('NOT_FOUND', __('api.saas.user_not_found'), 404);
        }

        if ($org->teamMembers()->where('user_id', $invitee->id)->exists()) {
            return $this->error('CONFLICT', __('api.saas.already_member'), 409);
        }

        $sub = $org->activeSubscription();
        if ($sub !== null) {
            $sub->load('plan');
            $maxMembers = $sub->plan->limits['maxMembers'] ?? null;
            if ($maxMembers !== null && $org->teamMembers()->count() >= $maxMembers) {
                return $this->error('VALIDATION_ERROR', __('api.saas.member_limit_reached'), 422);
            }
        }

        $member = TeamMember::create([
            'organization_id' => $org->id,
            'user_id' => $invitee->id,
            'role' => $validated['role'],
            'joined_at' => now(),
        ]);

        return $this->created([
            'id' => $member->id,
            'user' => ['name' => $invitee->name, 'email' => $invitee->email],
            'role' => $member->role,
            'joinedAt' => $member->joined_at,
        ]);
    }
}
