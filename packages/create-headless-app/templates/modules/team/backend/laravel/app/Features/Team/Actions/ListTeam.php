<?php

declare(strict_types=1);

namespace App\Features\Team\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListTeam
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
        $org     = $request->attributes->get('org');
        $members = $org->teamMembers()->with('user')->get()->map(fn ($m) => [
            'id'       => $m->id,
            'user'     => ['name' => $m->user->name, 'email' => $m->user->email],
            'role'     => $m->role,
            'joinedAt' => $m->joined_at,
        ]);

        return $this->success($members);
    }
}
