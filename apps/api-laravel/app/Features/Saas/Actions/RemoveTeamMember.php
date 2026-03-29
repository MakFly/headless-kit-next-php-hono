<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RemoveTeamMember
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
            return $this->error('ACCESS_DENIED', __('api.saas.cannot_remove_owner'), 403);
        }

        $member->delete();

        return $this->deleted(__('api.saas.member_removed'));
    }
}
