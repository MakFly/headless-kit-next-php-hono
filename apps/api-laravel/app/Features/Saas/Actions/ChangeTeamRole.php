<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChangeTeamRole
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
        $org = $request->attributes->get('org');
        $member = $org->teamMembers()->find($id);

        if ($member === null) {
            return $this->error('NOT_FOUND', __('api.saas.member_not_found'), 404);
        }

        if ($member->role === 'owner') {
            return $this->error('ACCESS_DENIED', __('api.saas.cannot_change_owner'), 403);
        }

        $validated = $request->validate([
            'role' => ['required', 'in:admin,member,viewer'],
        ]);

        $member->update(['role' => $validated['role']]);

        return $this->success([
            'id' => $member->id,
            'role' => $member->role,
        ]);
    }
}
