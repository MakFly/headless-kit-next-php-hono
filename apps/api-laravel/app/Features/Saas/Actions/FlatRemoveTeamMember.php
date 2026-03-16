<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatRemoveTeamMember
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->error('NOT_FOUND', __('api.org.not_found'), 404);
        }

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
