<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatListTeam
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->success([]);
        }

        $members = $org->teamMembers()->with('user')->get()->map(fn ($m) => [
            'id'       => $m->id,
            'user'     => ['name' => $m->user->name, 'email' => $m->user->email],
            'role'     => $m->role,
            'joinedAt' => $m->joined_at,
        ]);

        return $this->success($members);
    }
}
