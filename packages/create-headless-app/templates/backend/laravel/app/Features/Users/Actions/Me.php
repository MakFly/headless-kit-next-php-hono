<?php

declare(strict_types=1);

namespace App\Features\Users\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Me
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load('roles.permissions');

        return $this->success([
            'id'                => $user->id,
            'name'              => $user->name,
            'email'             => $user->email,
            'avatar'            => $user->avatar ?? null,
            'email_verified_at' => $user->email_verified_at,
            'created_at'        => $user->created_at,
            'updated_at'        => $user->updated_at,
            'roles'             => $user->roles->map(fn ($role) => [
                'id'   => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
            ]),
            'permissions' => $user->getAllPermissions()->map(fn ($perm) => [
                'id'       => $perm->id,
                'name'     => $perm->name,
                'slug'     => $perm->slug,
                'resource' => $perm->resource,
                'action'   => $perm->action,
            ])->values(),
        ]);
    }
}
