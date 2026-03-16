<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Role;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SyncPermissions
{
    use ApiResponder;

    public function __invoke(Role $role, Request $request): JsonResponse
    {
        $validated = $request->validate(['permissions' => 'required|array']);
        $role->permissions()->sync($validated['permissions']);

        return $this->success($role->load('permissions'), 200, ['message' => __('api.admin.permissions_updated')]);
    }
}
